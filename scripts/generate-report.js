const fs = require('fs');
const path = require('path');


const artifactsDir = path.join(__dirname, '../artifacts');
const reportFile = path.join(artifactsDir, 'compliance-report.md');

// Функция для чтения файлов и парсинга их в JSON
const readJsonFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading or parsing file ${filePath}:`, err);
    return null;
  }
};


const gitleaks = readJsonFile(path.join(artifactsDir, 'gitleaks.json'));
const trivyFs = readJsonFile(path.join(artifactsDir, 'trivy-fs.json'));
const trivyImage = readJsonFile(path.join(artifactsDir, 'trivy-image.json'));


// Логика для проверки PASS/FAIL
const checks = {
  'SEC-01': gitleaks && gitleaks.find(leak => leak.Level === 'HIGH') ? 'FAIL' : 'PASS',  
  'SEC-02': trivyFs && trivyImage ? 'PASS' : 'FAIL',   
  'SEC-06': gitleaks || trivyFs || trivyImage || dockle ? 'PASS' : 'FAIL'  
};

// Генерация отчета в формате Markdown
const generateReport = () => {
  const timestamp = new Date().toISOString();

  let reportContent = `# Compliance Report\n\n`;
  reportContent += `## Timestamp\n${timestamp}\n\n`;

  reportContent += `## Control Summary\n| Control | Status | Details |\n|---------|--------|---------|\n`;

  // Добавление данных для каждого контроля
  for (const [control, status] of Object.entries(checks)) {
    reportContent += `| ${control} | ${status} | Details for ${control} |\n`;
  }

  // Определение общего статуса
  const overallStatus = Object.values(checks).includes('FAIL') ? 'NOT PASS' : 'PASS';
  reportContent += `\n## Overall Status\n${overallStatus}\n`;

  // Запись отчета в файл
  fs.writeFileSync(reportFile, reportContent, 'utf8');


  console.log('Compliance Report Generated:');
  console.log(reportContent);
};


generateReport();

