using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;

class Program {
    static void Main() {
        try {
            string tempDir = Path.Combine(Path.GetTempPath(), "FocusTimerWidgetApp");
            Directory.CreateDirectory(tempDir);
            
            string exePath = Path.Combine(tempDir, "FocusTimer_Widget_core.exe");
            string neuPath = Path.Combine(tempDir, "resources.neu");
            
            ExtractResource("FocusTimer_Widget_core.exe", exePath);
            ExtractResource("resources.neu", neuPath);
            
            ProcessStartInfo psi = new ProcessStartInfo(exePath);
            psi.WorkingDirectory = tempDir;
            psi.UseShellExecute = true;
            Process.Start(psi);
        } catch (Exception ex) {
            System.Windows.Forms.MessageBox.Show("오류 발생: " + ex.Message);
        }
    }

    static void ExtractResource(string resourceName, string outPath) {
        Assembly assembly = Assembly.GetExecutingAssembly();
        using (Stream stream = assembly.GetManifestResourceStream(resourceName)) {
            if (stream == null) return;
            using (FileStream fs = new FileStream(outPath, FileMode.Create, FileAccess.Write)) {
                stream.CopyTo(fs);
            }
        }
    }
}
