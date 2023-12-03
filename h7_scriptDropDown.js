"use strict";

class MyRndUtilities {

    static bernoulliVariate(p) {
      return (Math.random() <= p) ? 1 : 0;
    }
  
    static RademacherVariate() {
      return (Math.random() <= 0.5) ? -1 : 1;
    }
  
    static normaleStandardSaved = undefined;
  
    //Marsaglia polar method
    static gaussian(Mean, StdDev) {
  
      if (this.normaleStandardSaved) {
        const normale = Mean + StdDev * this.normaleStandardSaved;
        this.normaleStandardSaved = undefined;
        return normale;
  
      } else {
  
        let u, v, s = 0;
  
        while (s >= 1 || s === 0) {
          u = 2 * Math.random() - 1;
          v = 2 * Math.random() - 1;
          s = u * u + v * v;
        }
  
        s = Math.sqrt(-2 * Math.log(s) / s);
        this.normaleStandardSaved = v * s;
        return Mean + StdDev * u * s;
  
      }
  
    }
  }
  

    //enum per scegliere il tipo di grandezza da rappresentare
    const MyChosenVariate = Object.freeze({
        RANDOM_WALK: Symbol("randomWalk"),
        POISSON: Symbol("Poisson"),
        BROWNIAN_MOTION_STANDARD: Symbol("brownianMotion_Standard"),
        BROWNIAN_MOTION_GENERAL: Symbol("brownianMotion"),
        BROWNIAN_MOTION_GEOMETRIC: Symbol("brownianMotion_Geometric"),
        ORNSTEIN_UHLENBECK: Symbol("ornsteinUhlenbeck")
    });

    const inputMu = document.getElementById("inputMu");
    const inputSigma = document.getElementById("inputSigma");
    const inputLambda = document.getElementById("inputLambda");
    const inputTheta = document.getElementById("inputTheta");
    const inputTimes = document.getElementById("inputTimes");
    const inputPaths = document.getElementById("inputPaths");

    const dropdown = document.getElementById("gruppo");

    const myCanvas = document.getElementById("myCanvas");
    const ctx = myCanvas.getContext("2d");

    let mu, sigma, lambda, n, theta;
    let numberOfSamplePaths;
    let allPaths;
    let myRandomJump;
    let myVariate;
    let representAsScalingLimit;
    let myProcessValueType;
    let myProcessValueDescription;
    let myVariate_MinView;
    let myVariate_MaxView;
    let myProcessValue_Range;
    let intervalSize;
    let NumberOfClasses;
    let x_Origin;
    let y_Origin;
    let timeForHistogram_t;
    let timeForHistogram_n;
    let avgAtLastTime;              
    let ssAtLastTime;               
    let intervals_t;               
    let intervals_n;                
    let MyTimer;
    let currentPathNumber;
    let mul;

    const rectChart = new Rettangolo(20, 30, myCanvas.width - 200, myCanvas.height - 30 - 40);

    mainTask();

    function acquisizioneScelteUtente() {

        mu = Number(inputMu.value);
        sigma = Number(inputSigma.value);
        lambda = Number(inputLambda.value);
        theta = Number(inputTheta.value);
        n = Math.round(Number(inputTimes.value));  //forzo conversione intero per assicurare l'uguaglianza con l'indice t del loop
        numberOfSamplePaths = Number(inputPaths.value);
        NumberOfClasses = Math.max(100, numberOfSamplePaths / 60);

        timeForHistogram_t = Math.round(n / 2);
        timeForHistogram_n = n;

        const sigmaMultipleForRange = 4;

        const dt = 1 / n;
        const sigma_sqrt_dt = sigma * Math.sqrt(dt);          //varianza proporzionale al tempo
        const sqrt_dt = Math.sqrt(dt);              //caso di sigma=1

        const dropdown = document.getElementById("gruppo");
        console.log(dropdown.value)

        const selectedValue = dropdown.value;
        
        // Perform actions based on the selected value
        switch (selectedValue) {
            case "RANDOM_WALK":
                // Code for Random Walk option
                myProcessValueDescription = "Random Walk (sum of scaled Rademacher rv's = Σ σ R(-1,1), ±1 jumps, p=.5, mean=0, var = σ² t, std = σ √t";
                myProcessValueType = MyChosenVariate.RANDOM_WALK;
                representAsScalingLimit = false;
                myVariate_MinView = -sigmaMultipleForRange * sigma * Math.sqrt(n);
                myVariate_MaxView = sigmaMultipleForRange * sigma * Math.sqrt(n);
                myRandomJump = () => MyRndUtilities.RademacherVariate();
                myVariate = (sumOfJumps) => (sigma * sumOfJumps);
                mul = false;
                break;
            case "POISSON":
                // Code for Poisson option
                myProcessValueDescription = "Poisson with rate λ ( ≈ Σ Be(λ/n), mean=λ, var=λ )";
                myProcessValueType = MyChosenVariate.POISSON;
                representAsScalingLimit = false;
                myVariate_MinView = 0;
                myVariate_MaxView = lambda * 1.5;
                myRandomJump = () => MyRndUtilities.bernoulliVariate(lambda / n);
                myVariate = (sumOfJumps) => (sumOfJumps);
                mul = false;
                break;
            case "BROWNIAN_MOTION_STANDARD":
                // Code for Standard Brownian Motion option
                myProcessValueDescription = 'Standard BM ≈ Σ N(0, dt), where dt=1/n, mean=0, var=1 at last time n, taken as 1';
                myProcessValueType = MyChosenVariate.BROWNIAN_MOTION_STANDARD;
                representAsScalingLimit = true;
                myVariate_MinView = -sigmaMultipleForRange;
                myVariate_MaxView = sigmaMultipleForRange;
                myRandomJump = () => MyRndUtilities.gaussian(0, sqrt_dt);
                myVariate = (sumOfJumps) => sumOfJumps;
                mul = false; 
                break;
            case "BROWNIAN_MOTION_GEN":
                // Code for Brownian Motion (arithmetic) option
                myProcessValueDescription = "general (arithmetic) Brownian motion ≈ Σ N(μ dt, σ² dt), where dt=1/n, mean=μ, var=σ² at last time n, taken as 1";
                myProcessValueType = MyChosenVariate.BROWNIAN_MOTION_GENERAL;
                representAsScalingLimit = true;
                myVariate_MinView = Math.min(0, mu - sigmaMultipleForRange * sigma);
                myVariate_MaxView = Math.max(0, mu + sigmaMultipleForRange * sigma);
                myRandomJump = () => MyRndUtilities.gaussian(mu * dt, sigma_sqrt_dt);
                myVariate = (sumOfJumps) => sumOfJumps;
                mul = false;
                break;
            case "BROWNIAN_MOTION_GEO":
                // Code for Brownian Motion (geometric) option
                myProcessValueDescription = "Geometric Brownian Motion ≈ S_t = S_0 * exp((μ - σ²/2)t + σ W_t), where W_t is a standard BM";
                myProcessValueType = MyChosenVariate.BROWNIAN_MOTION_GEOMETRIC;
                representAsScalingLimit = true;
                myVariate_MinView = 0;
                myVariate_MaxView = Math.exp((mu + 3 * sigma) * n * dt);
                myRandomJump = () => Math.exp(MyRndUtilities.gaussian((mu - sigma * sigma / 2) * dt, sigma_sqrt_dt));
                myVariate = (productOfJumps) => productOfJumps;
                mul = true;
                break;
            case "ORNSTEIN_UHLENBECK":
                // Code for Ornstein-Uhlenbeck option
                myProcessValueDescription = "Ornstein-Uhlenbeck process ≈ X_t = θ(μ - X_t)dt + σ dW_t, where W_t is a standard BM))";
                myProcessValueType = MyChosenVariate.ORNSTEIN_UHLENBECK;
                representAsScalingLimit = false;
                myVariate_MinView = mu - sigmaMultipleForRange * sigma;
                myVariate_MaxView = mu + sigmaMultipleForRange * sigma;
                myRandomJump = (currentX) => MyRndUtilities.gaussian(theta * (mu - currentX) * dt, sigma_sqrt_dt);
                myVariate = (sumOfJumps) => sumOfJumps;
                mul = false;
                break;
            default:
                // Default code if needed
                break;
        }
        

        myProcessValue_Range = myVariate_MaxView - myVariate_MinView;
        intervalSize = myProcessValue_Range / NumberOfClasses;

        [x_Origin, y_Origin] = My2dUtilities.transformXYToViewport([0, 0], 0, n, myVariate_MinView, myProcessValue_Range, rectChart);

    }

    function mainTask() {

        clearInterval(MyTimer);
        acquisizioneScelteUtente();     
        intervals_t = [];               //intervalli per distribuzione tempo intermedio
        intervals_n = [];               //intervalli per distribuzione tempo finale
        currentPathNumber = 0;
        avgAtLastTime = 0;              //media della variata al tempo n
        ssAtLastTime = 0;               //somma quadrati della variata al tempo n
        ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
        allPaths = [];

        // Generate sample paths (all at once)
        for (let s = 1; s <= numberOfSamplePaths; s++) {
            const newPath = createSinglePath(s);
            allPaths.push(newPath);
            ctx.lineWidth = 1;
            ctx.strokeStyle = MyChartUtilities.randomColorCSS();
            ctx.stroke(newPath);
        }

        sovrapponiIstogrammi();
        creaTaccheELegenda();
    }


    function sovrapponiIstogrammi() {

        //rettangolo contenitore istogramma
        const rettangoloIstogramma_t = new Rettangolo(My2dUtilities.transformX(timeForHistogram_t, 0, n, rectChart.x, rectChart.width), rectChart.y, 150, rectChart.height);
        const rettangoloIstogramma_n = new Rettangolo(My2dUtilities.transformX(timeForHistogram_n, 0, n, rectChart.x, rectChart.width), rectChart.y, 150, rectChart.height);
        rettangoloIstogramma_t.disegnaRettangolo(ctx, "rgba(100,100,250,0.5)", 1, [1, 1]);
        rettangoloIstogramma_n.disegnaRettangolo(ctx, "black", 1, []);

        //istogrammi
        MyChartUtilities.verticalHistoFromIntervals(ctx, intervals_t, myVariate_MinView, myVariate_MaxView - myVariate_MinView, rettangoloIstogramma_t, "red", 1, "green");
        MyChartUtilities.verticalHistoFromIntervals(ctx, intervals_n, myVariate_MinView, myVariate_MaxView - myVariate_MinView, rettangoloIstogramma_n, "red", 1, "red");

    }

    function createSinglePath(s) {

        currentPathNumber = s;
        const myPath = new Path2D();

        let sumOfJumps = mul ? 1 : 0;
        let previousY_Variate = y_Origin;

        // The path starts from the origin
        myPath.moveTo(x_Origin, y_Origin); 

        for (let t = 1; t <= n; t++) {

            sumOfJumps = mul ? sumOfJumps * myRandomJump(sumOfJumps) : sumOfJumps + myRandomJump(sumOfJumps);
            let myProcessValue = myVariate(sumOfJumps, t);

            //raccolta valori per istogramma
            if (t === timeForHistogram_t) {
                MyDistributionUtilities.allocateValueInIntervals(myProcessValue, intervals_t, intervalSize);
            } else if (t === timeForHistogram_n) {
                MyDistributionUtilities.allocateValueInIntervals(myProcessValue, intervals_n, intervalSize);
                [avgAtLastTime, ssAtLastTime] = MyDistributionUtilities.UpdateMeanAndSS(myProcessValue, s, [avgAtLastTime, ssAtLastTime]);
            }

            const ascissa_t = My2dUtilities.transformX(t / n, 0, 1, rectChart.x, rectChart.width);
            const ordinata = My2dUtilities.transformY(myProcessValue, myVariate_MinView, myProcessValue_Range, rectChart.y, rectChart.height);

            //scalino mantenendo quota precedente
            myPath.lineTo(ascissa_t, previousY_Variate);
            //salva quota per prossimo scalino
            previousY_Variate = ordinata;

            myPath.lineTo(ascissa_t, ordinata);
        }

        return myPath;

    }

    function creaTaccheELegenda() {

        //rettangolo simulazione
        rectChart.disegnaRettangolo(ctx, "black", 1, []);

        //label riferimenti numerici range, media, sigma della variata
        ctx.font = "11px Verdana";
        ctx.fillStyle = "black";
        ctx.fillText(myVariate_MaxView.toFixed(1), rectChart.right() + 10, rectChart.y - 7);
        ctx.fillText(myVariate_MinView.toFixed(1), rectChart.right() + 10, rectChart.bottom() - 7);
        ctx.fillStyle = "black";
        ctx.fillText("paths: " + currentPathNumber + "  avg = " + avgAtLastTime.toFixed(2) + "  var = " + (ssAtLastTime / numberOfSamplePaths).toFixed(2), rectChart.x + 350, rectChart.bottom() + 30);
        ctx.fillStyle = "black";
        //ctx.fillText(myProcessValueDescription, rectChart.x + 100, rectChart.y + 15);

        //tacche tempi/trials e tempi

        ctx.beginPath();

        if (representAsScalingLimit) {      //scaling limit: 0 -- 1
            ctx.fillStyle = "black";
            ctx.strokeStyle = "black";
            for (let t = 0; t <= 1; t += 0.1) {
                let ascissa_t = My2dUtilities.transformX(t, 0, 1, rectChart.x, rectChart.width);
                ctx.moveTo(ascissa_t, rectChart.bottom() - 3);
                ctx.lineTo(ascissa_t, rectChart.bottom() + 3);
                ctx.fillText(t.toFixed(1).toString(), ascissa_t - 5, rectChart.bottom() + 15);
            }

        } else {

            ctx.fillStyle = "black";
            ctx.strokeStyle = "black";
            const step = 10 ** Math.round(Math.log10(n) - 1);
            for (let t = 0; t <= n; t += step) {
                let ascissa_t = My2dUtilities.transformX(t, 0, n, rectChart.x, rectChart.width);
                ctx.moveTo(ascissa_t, rectChart.bottom() - 3);
                ctx.lineTo(ascissa_t, rectChart.bottom() + 3);
                ctx.fillText(t.toFixed(1).toString(), ascissa_t - 5, rectChart.bottom() + 15);
            }
        }
        ctx.stroke();

    }
