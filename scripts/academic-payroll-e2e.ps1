param(
  [string]$BaseUrl = 'http://localhost:3100/api/v1',
  [string]$TeacherEmail = 'elena.torres@sanjose.edu.pe',
  [string]$TeacherPassword = 'Cole2026!',
  [string]$ParentEmail = 'padre.garcia@email.com',
  [string]$ParentPassword = 'Cole2026!',
  [string]$DirectorEmail = 'director@sanjose.edu.pe',
  [string]$DirectorPassword = 'Cole2026!'
)

$ErrorActionPreference = 'Stop'

function Request-Json {
  param([string]$Method, [string]$Uri, [hashtable]$Headers = @{}, [object]$Body = $null)
  $params = @{ Method = $Method; Uri = $Uri; Headers = $Headers; ContentType = 'application/json' }
  if ($null -ne $Body) { $params.Body = $Body | ConvertTo-Json -Depth 10 }
  Invoke-RestMethod @params
}

$teacher = Request-Json Post "$BaseUrl/auth/login" -Body @{ email = $TeacherEmail; password = $TeacherPassword }
$teacherHeaders = @{ Authorization = "Bearer $($teacher.accessToken)" }
$sections = Request-Json Get "$BaseUrl/academic/sections?teacherId=$($teacher.user.id)" -Headers $teacherHeaders
if ($sections.Count -lt 1 -or $sections[0].evaluations.Count -lt 1) { throw 'Teacher has no seeded section/evaluation' }

$section = $sections[0]
$evaluation = $section.evaluations[0]
$grades = @($section.section.enrollments | ForEach-Object {
  @{ studentId = $_.student.id; score = 17.5; feedback = 'Automated E2E grade' }
})
$submit = Request-Json Post "$BaseUrl/academic/grades/submit" -Headers $teacherHeaders -Body @{
  evaluationId = $evaluation.id
  academicPeriodId = $evaluation.academicPeriodId
  grades = $grades
}
if ($submit.status -ne 'SUBMITTED') { throw "Expected SUBMITTED grades, got $($submit.status)" }

$director = Request-Json Post "$BaseUrl/auth/login" -Body @{ email = $DirectorEmail; password = $DirectorPassword }
$directorHeaders = @{ Authorization = "Bearer $($director.accessToken)" }
$published = Request-Json Patch "$BaseUrl/academic/evaluations/$($evaluation.id)/publish" -Headers $directorHeaders
if ($published.status -ne 'PUBLISHED') { throw "Expected PUBLISHED evaluation, got $($published.status)" }

$parent = Request-Json Post "$BaseUrl/auth/login" -Body @{ email = $ParentEmail; password = $ParentPassword }
$parentHeaders = @{ Authorization = "Bearer $($parent.accessToken)" }
$students = Request-Json Get "$BaseUrl/students/mine" -Headers $parentHeaders
$report = Request-Json Get "$BaseUrl/academic/report-card/$($students[0].id)" -Headers $parentHeaders
if ([int]$report.totalEvaluationsPublished -lt 1) { throw 'Published grade is not visible to parent' }

$periods = Request-Json Get "$BaseUrl/payroll/periods" -Headers $directorHeaders
$period = @($periods | Where-Object { $_.year -eq 2026 -and $_.month -eq 4 })[0]
if ($null -eq $period) {
  $period = Request-Json Post "$BaseUrl/payroll/periods" -Headers $directorHeaders -Body @{
    name = 'Planilla Mensual Abril 2026'; year = 2026; month = 4
    startDate = '2026-04-01'; endDate = '2026-04-30'
  }
}
$payroll = Request-Json Post "$BaseUrl/payroll/calculate" -Headers $directorHeaders -Body @{ periodId = $period.id }
$slips = Request-Json Get "$BaseUrl/payroll/periods/$($period.id)/slips" -Headers $directorHeaders
if ($payroll.status -ne 'APPROVED' -or $slips.Count -lt 1) { throw 'Payroll E2E invariant failed' }

[pscustomobject]@{
  gradesSubmitted = $grades.Count
  evaluationStatus = $published.status
  parentPublishedEvaluations = $report.totalEvaluationsPublished
  payrollStatus = $payroll.status
  payslips = $slips.Count
} | ConvertTo-Json
