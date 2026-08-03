using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

class Program {
    [STAThread]
    static void Main() {
        try {
            string profileDir = Path.Combine(Path.GetTempPath(), "FocusTimerEdgeProfile");
            Directory.CreateDirectory(profileDir);

            string edgePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe");
            if (!File.Exists(edgePath)) {
                edgePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe");
            }
            if (!File.Exists(edgePath)) {
                edgePath = "msedge.exe";
            }

            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = edgePath;
            psi.Arguments = string.Format("--app=https://willowy-beijinho-a6bdf2.netlify.app/?widget=true --user-data-dir=\"{0}\" --window-size=290,340", profileDir);
            Process.Start(psi);
        } catch (Exception ex) {
            MessageBox.Show("FocusTimer 실행 오류: " + ex.Message);
        }
    }
}
