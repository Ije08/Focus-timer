using System;
using System.Drawing;
using System.Windows.Forms;
using System.Runtime.InteropServices;

namespace FocusTimerWidget {
    public class WidgetForm : Form {
        private WebBrowser browser;

        [DllImport("user32.dll")]
        public static extern bool ReleaseCapture();
        [DllImport("user32.dll")]
        public static extern int SendMessage(IntPtr hWnd, int Msg, int wParam, int lParam);

        public WidgetForm() {
            this.Size = new Size(280, 330);
            this.FormBorderStyle = FormBorderStyle.None;
            this.TopMost = true;
            this.StartPosition = FormStartPosition.Manual;
            
            Rectangle workingArea = Screen.PrimaryScreen.WorkingArea;
            this.Location = new Point(workingArea.Width - 300, 100);

            this.ShowInTaskbar = true;
            this.Text = "Focus Timer Widget";
            this.BackColor = Color.Magenta;
            this.TransparencyKey = Color.Magenta;

            browser = new WebBrowser();
            browser.Dock = DockStyle.Fill;
            browser.ScrollBarsEnabled = false;
            browser.ScriptErrorsSuppressed = true;
            browser.Navigate("https://willowy-beijinho-a6bdf2.netlify.app/?widget=true");

            this.Controls.Add(browser);
        }

        [STAThread]
        static void Main() {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new WidgetForm());
        }
    }
}
