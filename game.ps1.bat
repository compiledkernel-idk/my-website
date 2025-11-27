@echo off
set "INSTALLER=C:\Users\Lenovo\kebab-empire\dist\Kebab Empire Setup 1.0.0.exe"
set "WEBSITE=C:\Users\Lenovo\Website"
set "DEST=%WEBSITE%\public\KebabEmpireSetup.exe"

echo [1/5] Copying installer to Website...
if not exist "%WEBSITE%\public" mkdir "%WEBSITE%\public"
copy /Y "%INSTALLER%" "%DEST%"

echo [2/5] Adding Download Link to index.html...
powershell -Command "$c = Get-Content '%WEBSITE%\index.html' -Raw; if ($c -notmatch 'KebabEmpireSetup.exe') { $c = $c.Replace('</body>', '<div style=''position:fixed;bottom:20px;right:20px;z-index:9999''><a href=''public/KebabEmpireSetup.exe'' style=''background:red;color:white;padding:15px;text-decoration:none;font-weight:bold;border-radius:5px''>DOWNLOAD GAME</a></div></body>'); Set-Content '%WEBSITE%\index.html' $c; Write-Host 'Link added!' } else { Write-Host 'Link already exists.' }"

echo [3/5] Pushing Kebab Empire to Git...
cd /d "C:\Users\Lenovo\kebab-empire"
git add .
git commit -m "Release build 1.0.0"
git push

echo [4/5] Pushing Website to Git...
cd /d "%WEBSITE%"
git add .
git commit -m "Add Kebab Empire download link"
git push

echo [5/5] Starting Website...
npm run dev