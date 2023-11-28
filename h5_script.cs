using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Windows.Forms;

class SecurityChart
{
    private static PictureBox canvas1b;
    private static Graphics ctx1b;

    private const double scaleFactor = 0.9; // Adjust this value as needed, where 1 is full size and 0.5 is half size, etc.

    private static bool isDragging = false;
    private static int startX, startY;

    [STAThread]
    static void Main()
    {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);

        Form form = new Form();
        form.Text = "Security Chart";

        canvas1b = new PictureBox();
        ctx1b = Graphics.FromImage(new Bitmap(1, 1));

        InitializeCanvas(canvas1b);

        form.Controls.Add(canvas1b);

        form.MouseDown += (sender, e) => StartDrag(e);
        form.MouseMove += (sender, e) => Drag(e);
        form.MouseUp += (sender, e) => StopDrag();
        form.MouseLeave += (sender, e) => StopDrag();
        form.Load += (sender, e) => UpdateAllCharts();

        Application.Run(form);
    }

    private static void InitializeCanvas(PictureBox canvas)
    {
        canvas.Paint += (sender, e) => { }; // Empty paint event handler
        canvas.Resize += (sender, e) => ScaleCanvasContent(canvas);
    }

    private static void StartDrag(MouseEventArgs e)
    {
        isDragging = true;
        startX = e.X;
        startY = e.Y;
    }

    private static void Drag(MouseEventArgs e)
    {
        if (!isDragging) return;

        int dx = e.X - startX;
        int dy = e.Y - startY;

        Control control = (Control)e.Target;
        control.Left = (control.Left + dx);
        control.Top = (control.Top + dy);

        startX = e.X;
        startY = e.Y;
    }

    private static void StopDrag()
    {
        isDragging = false;
    }

    private static void ScaleCanvasContent(PictureBox canvas)
    {
        Graphics ctx = Graphics.FromImage(new Bitmap(1, 1));
        Graphics tempCtx = Graphics.FromImage(new Bitmap(1, 1));

        Bitmap tempCanvas = new Bitmap(canvas.Width, canvas.Height);
        tempCtx.DrawImage(canvas.Image, 0, 0);

        canvas.Width = canvas.Parent.ClientRectangle.Width;
        canvas.Height = canvas.Parent.ClientRectangle.Height;

        ctx.DrawImage(tempCanvas, 0, 0, tempCanvas.Width, tempCanvas.Height, 0, 0, canvas.Width, canvas.Height);
    }

    private static List<double> SimulateScore(int N, double p, string type = "original")
    {
        List<double> scores = new List<double>();
        double score = 0;

        for (int i = 0; i < N; i++)
        {
            double probability = new Random().NextDouble();
            switch (type)
            {
                case "original":
                    score += (probability < p) ? -1 : 1;
                    break;
                case "1b":
                    score += (probability < p) ? 0 : 1;
                    break;
                case "1c":
                    score += (probability < p) ? 0 : 1;
                    score /= (i + 1);
                    break;
                case "1d":
                    score += (probability < p) ? 0 : 1;
                    score /= Math.Sqrt(i + 1);
                    break;
            }
            scores.Add(score);
        }
        return scores;
    }

    private static Dictionary<string, int> CountScoreIntervals(List<double> scores)
    {
        Dictionary<string, int> intervals = new Dictionary<string, int>();

        foreach (double score in scores)
        {
            int intervalBase = (int)Math.Floor(score / 2) * 2;
            string intervalKey = $"{intervalBase},{intervalBase + 2}";

            if (intervals.ContainsKey(intervalKey))
            {
                intervals[intervalKey]++;
            }
            else
            {
                intervals[intervalKey] = 1;
            }
        }
        return intervals;
    }

    private static List<string> GenerateColors(int count)
    {
        List<string> colors = new List<string>();
        for (int i = 0; i < count; i++)
        {
            colors.Add($"hsl({(i * 360) / count}, 100%, 50%)");
        }
        return colors;
    }

    private static void DrawChart(int M, int N, double p, string type, Graphics ctx, PictureBox canvas)
    {
        int attackNumber = int.Parse(new TextBox().Text); 

        int chartWidth = (int)(canvas.Width * scaleFactor);
        int chartHeight = (int)(canvas.Height * scaleFactor);

        int xOffset = 50;
        int yOffset = chartHeight / 2;
        double xScale = (chartWidth - xOffset) / N;
        double yScale = yOffset / N;

        ctx.Clear(Color.White);

        List<List<double>> allScores = new List<List<double>>();
        List<string> colors = GenerateColors(M);

        // Rest of the code remains the same
    }

    private static void UpdateChart()
    {
        int M = int.Parse(new TextBox().Text); 
        int N = int.Parse(new TextBox().Text); 
        int T = int.Parse(new TextBox().Text); 
        int lambda = int.Parse(new TextBox().Text); 
        double p = lambda * (T / N);
        DrawChart(M, N, p, "original", ctx1b, canvas1b);
    }

    private static void UpdateAllCharts()
    {
        int M = int.Parse(new TextBox().Text); 
        int N = int.Parse(new TextBox().Text); 
        int T = int.Parse(new TextBox().Text); 
        int lambda = int.Parse(new TextBox().Text); 
        double p = (lambda * (T / N)) % 1;

        var elementoRisultato = new Label(); 
        elementoRisultato.Text = "The probability λ * (T/N) is: " + p.ToString("F2");

        DrawChart(M, N, p, "1b", ctx1b, canvas1b);
    }
}
