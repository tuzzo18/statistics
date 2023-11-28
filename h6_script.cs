using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Windows.Forms;

class SimulationChart
{
    private static PictureBox canvas;
    private static Graphics ctx;

    private static double scaleFactor = 0.9; // Adjust this value as needed, where 1 is full size and 0.5 is half size, etc.

    private static bool isDragging = false;
    private static int startX, startY;

    [STAThread]
    static void Main()
    {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);

        Form form = new Form();
        form.Text = "Simulation Chart";

        canvas = new PictureBox();
        ctx = Graphics.FromImage(new Bitmap(1, 1));

        InitializeCanvas(canvas);

        form.Controls.Add(canvas);

        form.Load += (sender, e) => UpdateChart();

        Application.Run(form);
    }

    private static void InitializeCanvas(PictureBox canvas)
    {
        canvas.Paint += (sender, e) => { }; // Empty paint event handler
        canvas.Resize += (sender, e) => { };
        canvas.MouseDown += (sender, e) => StartDrag(e);
        canvas.MouseMove += (sender, e) => Drag(e);
        canvas.MouseUp += (sender, e) => StopDrag();
        canvas.MouseLeave += (sender, e) => StopDrag();
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

    private static List<int> SimulateScore(int N, double p)
    {
        List<int> scores = new List<int>();
        int score = 0;

        for (int i = 0; i < N; i++)
        {
            double probability = new Random().NextDouble();
            score += (probability < p) ? 1 : -1;
            scores.Add(score);
        }
        return scores;
    }

    private static Dictionary<int, int> CountFirstThresholds(List<List<int>> scores, int S, List<int> P_values)
    {
        Dictionary<int, int> counts = new Dictionary<int, int>();

        foreach (List<int> scoreArr in scores)
        {
            bool hasReachedS = false;
            Dictionary<int, bool> hasReachedP = new Dictionary<int, bool>();

            foreach (int score in scoreArr)
            {
                if (!hasReachedS && score <= S)
                {
                    if (counts.ContainsKey(S))
                        counts[S]++;
                    else
                        counts[S] = 1;

                    hasReachedS = true;
                }

                foreach (int P in P_values)
                {
                    if (score >= P)
                    {
                        if (!hasReachedP.ContainsKey(P))
                        {
                            hasReachedP[P] = true;
                            if (counts.ContainsKey(P))
                                counts[P]++;
                            else
                                counts[P] = 1;
                        }
                    }
                }
            }
        }
        return counts;
    }

    private static void DrawChart(int M, int N, double p, int S, Graphics ctx, PictureBox canvas, List<int> P_values)
    {
        int chartWidth = (int)(canvas.Width * scaleFactor);
        int chartHeight = (int)(canvas.Height * scaleFactor);

        int xOffset = 50;
        int yOffset = chartHeight / 2;
        double xScale = (chartWidth - xOffset) / N;
        double yScale = yOffset / N;

        ctx.Clear(Color.White);
        List<List<int>> allScores = new List<List<int>>();
        List<string> colors = GenerateColors(M);

        // Rest of the code remains the same
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

    private static void UpdateChart()
    {
        int M = int.Parse(new TextBox().Text); 
        int N = int.Parse(new TextBox().Text); 
        double p = double.Parse(new TextBox().Text); 
        int S = -int.Parse(new TextBox().Text); 
        List<int> P_values = new List<int> { 20, 30, 40, 50, 60, 70, 80, 90, 100 };
        DrawChart(M, N, p, S, ctx, canvas, P_values);
    }
}
