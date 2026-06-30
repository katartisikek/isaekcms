$file = 'src\App.jsx'
$lines = Get-Content $file
$startLine = 865
$endLine = 980
$newSidebar = @(
'          {/* Left Tree/Sidebar */}',
'          <div className="desktop-sidebar">',
'            <h4 className="sidebar-title">Menu</h4>',
'            {(() => {',
'              const pendingTasksCount = tasks.filter(t => t.status === "Εκκρεμεί").length;',
'              const debtStudentsCount = students.filter(s => parseFloat(s.totalDebt || 0) > 0).length;',
'              const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);',
'              const newInterestsCount = interests.filter(i => i.createdAt && new Date(i.createdAt) > sevenDaysAgo).length;',
'              return (',
'                <ul className="sector-list" style={{ marginBottom: "14px", borderBottom: "1px solid #cbd5e1", paddingBottom: "8px" }}>',
'                  <li className="sector-item" style={{ marginBottom: "4px" }} onClick={() => { setShowStartScreen(true); setCurrentView("students"); }}>',
'                    <Home size={14} color="var(--primary)" /><span>Αρχική Οθόνη</span>',
'                  </li>',
'                  <li className={`sector-item ${currentView === "students" && selectedSector === "" ? "active" : ""}`} onClick={() => { setCurrentView("students"); setSelectedSector(""); setSelectedSpecialty(""); setShowStartScreen(false); }}>',
'                    <Database size={14} /><span>Βάση Σπουδαστών</span>',
'                    {debtStudentsCount > 0 && <span style={{ marginLeft:"auto", background:"#fef3c7", color:"#92400e", fontSize:"11px", fontWeight:"700", borderRadius:"10px", padding:"1px 6px" }} title={debtStudentsCount + " με οφειλές"}>{debtStudentsCount}</span>}',
'                  </li>',
'                  <li className={`sector-item ${currentView === "bek_graduates" ? "active" : ""}`} onClick={() => { setCurrentView("bek_graduates"); setSelectedSector(""); setSelectedSpecialty(""); setShowStartScreen(false); }}>',
'                    <GraduationCap size={14} /><span>Απόφοιτοι ΒΕΚ</span>',
'                  </li>',
'                  <li className={`sector-item ${currentView === "tasks" ? "active" : ""}`} onClick={() => { setCurrentView("tasks"); setShowStartScreen(false); }}>',
'                    <CheckSquare size={14} /><span>Εργασίες (Kanban)</span>',
'                    {pendingTasksCount > 0 && <span style={{ marginLeft:"auto", background:"#fee2e2", color:"#991b1b", fontSize:"11px", fontWeight:"700", borderRadius:"10px", padding:"1px 6px" }} title={pendingTasksCount + " εκκρεμείς"}>{pendingTasksCount}</span>}',
'                  </li>',
'                  <li className={`sector-item ${currentView === "contacts" ? "active" : ""}`} onClick={() => { setCurrentView("contacts"); setShowStartScreen(false); }}>',
'                    <BookOpen size={14} /><span>Τηλεφωνικός Κατάλογος</span>',
'                  </li>',
'                  <li className={`sector-item ${currentView === "calendar" ? "active" : ""}`} onClick={() => { setCurrentView("calendar"); setShowStartScreen(false); }}>',
'                    <CalendarIcon size={14} /><span>Ημερολόγιο (Πρόγραμμα)</span>',
'                  </li>',
'                  <li className={`sector-item ${currentView === "teacher_reports" ? "active" : ""}`} onClick={() => { setCurrentView("teacher_reports"); setShowStartScreen(false); }}>',
'                    <FileText size={14} /><span>Αναφορές Καθηγητών</span>',
'                  </li>',
'                  <li className={`sector-item ${currentView === "grades" ? "active" : ""}`} onClick={() => { setCurrentView("grades"); setShowStartScreen(false); }}>',
'                    <FileText size={14} /><span>Βαθμολογίες</span>',
'                  </li>',
'                  <li className={`sector-item ${currentView === "interests" ? "active" : ""}`} onClick={() => { setCurrentView("interests"); setShowStartScreen(false); }}>',
'                    <MessageSquare size={14} /><span>Εκδηλώσεις Ενδιαφέροντος</span>',
'                    {newInterestsCount > 0 && <span style={{ marginLeft:"auto", background:"#fce7f3", color:"#9d174d", fontSize:"11px", fontWeight:"700", borderRadius:"10px", padding:"1px 6px" }} title={newInterestsCount + " νέες (7 ημέρες)"}>{newInterestsCount}</span>}',
'                  </li>',
'                </ul>',
'              );',
'            })()}',
'            <h4 className="sidebar-title">Διαχείριση Συστήματος</h4>',
'            <ul className="sector-list">',
'              <li className={`sector-item ${currentView === "settings" ? "active" : ""}`} onClick={() => { setCurrentView("settings"); setShowStartScreen(false); }}>',
'                <Settings size={14} color="#64748b" /><span>Εργαλεία Διαχειριστή</span>',
'              </li>',
'              <li className={`sector-item ${currentView === "audit_log" ? "active" : ""}`} onClick={() => { setCurrentView("audit_log"); setShowStartScreen(false); }}>',
'                <FileText size={14} color="#64748b" /><span>Ιστορικό Αλλαγών</span>',
'              </li>',
'            </ul>',
'          </div>'
)
$before = $lines[0..($startLine-2)]
$after = $lines[$endLine..($lines.Length-1)]
$result = $before + $newSidebar + $after
[System.IO.File]::WriteAllLines((Resolve-Path $file).Path, $result, [System.Text.Encoding]::UTF8)
Write-Host "Sidebar replaced successfully"
