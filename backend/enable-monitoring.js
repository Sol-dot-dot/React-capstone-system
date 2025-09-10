const fs = require('fs');
const path = require('path');

console.log('🔧 Monitoring System Setup Script');
console.log('================================\n');

// Function to safely enable monitoring features
function enableMonitoringFeature(feature) {
  const serverPath = path.join(__dirname, 'server.js');
  let serverContent = fs.readFileSync(serverPath, 'utf8');
  
  switch (feature) {
    case 'basic-logging':
      console.log('📝 Enabling basic logging...');
      // Uncomment logger import
      serverContent = serverContent.replace(
        '// const { logger } = require(\'./config/logger\');',
        'const { logger } = require(\'./config/logger\');'
      );
      // Uncomment logger initialization
      serverContent = serverContent.replace(
        /\/\/ logger\.info\('🚀 Server started successfully'/g,
        'logger.info(\'🚀 Server started successfully\''
      );
      break;
      
    case 'monitoring-routes':
      console.log('🛣️  Enabling monitoring routes...');
      serverContent = serverContent.replace(
        '// app.use(\'/api/monitoring\', require(\'./routes/monitoring\'));',
        'app.use(\'/api/monitoring\', require(\'./routes/monitoring\'));'
      );
      break;
      
    case 'monitoring-middleware':
      console.log('🔍 Enabling monitoring middleware...');
      // Uncomment middleware imports
      serverContent = serverContent.replace(
        '// const { \n//   requestTiming, \n//   performanceMonitoring, \n//   auditLogging, \n//   errorTracking, \n//   securityMonitoring \n// } = require(\'./middleware/monitoring\');',
        'const { \n  requestTiming, \n  performanceMonitoring, \n  auditLogging, \n  errorTracking, \n  securityMonitoring \n} = require(\'./middleware/monitoring\');'
      );
      // Uncomment middleware usage
      serverContent = serverContent.replace(
        '// app.use(requestTiming);',
        'app.use(requestTiming);'
      );
      serverContent = serverContent.replace(
        '// app.use(performanceMonitoring);',
        'app.use(performanceMonitoring);'
      );
      serverContent = serverContent.replace(
        '// app.use(auditLogging);',
        'app.use(auditLogging);'
      );
      serverContent = serverContent.replace(
        '// app.use(securityMonitoring);',
        'app.use(securityMonitoring);'
      );
      serverContent = serverContent.replace(
        '// app.use(errorTracking);',
        'app.use(errorTracking);'
      );
      break;
  }
  
  // Write the updated content back
  fs.writeFileSync(serverPath, serverContent);
  console.log(`✅ ${feature} enabled successfully`);
}

// Function to test monitoring features
async function testMonitoringFeatures() {
  console.log('\n🧪 Testing monitoring features...');
  
  try {
    const axios = require('axios');
    
    // Test health endpoint
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health endpoint working');
    
    // Test monitoring health endpoint (if enabled)
    try {
      console.log('2️⃣ Testing monitoring health endpoint...');
      const monitoringHealthResponse = await axios.get('http://localhost:5000/api/monitoring/health');
      console.log('✅ Monitoring health endpoint working');
    } catch (error) {
      console.log('⚠️  Monitoring health endpoint not available (normal if not enabled yet)');
    }
    
    // Test chatbot endpoint
    console.log('3️⃣ Testing chatbot endpoint...');
    const chatbotResponse = await axios.get('http://localhost:5000/api/chatbot/test');
    console.log('✅ Chatbot endpoint working');
    
    console.log('\n🎉 All available monitoring features are working!');
    
  } catch (error) {
    console.error('❌ Error testing monitoring features:', error.message);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node enable-monitoring.js [feature]');
    console.log('\nAvailable features:');
    console.log('  basic-logging      - Enable basic Winston logging');
    console.log('  monitoring-routes  - Enable monitoring API routes');
    console.log('  monitoring-middleware - Enable monitoring middleware');
    console.log('  test              - Test current monitoring features');
    console.log('  all               - Enable all monitoring features');
    console.log('\nExample: node enable-monitoring.js basic-logging');
    return;
  }
  
  const feature = args[0];
  
  if (feature === 'test') {
    await testMonitoringFeatures();
  } else if (feature === 'all') {
    enableMonitoringFeature('basic-logging');
    enableMonitoringFeature('monitoring-routes');
    enableMonitoringFeature('monitoring-middleware');
    console.log('\n🎉 All monitoring features enabled!');
    console.log('⚠️  Please restart the server for changes to take effect.');
  } else {
    enableMonitoringFeature(feature);
    console.log('\n⚠️  Please restart the server for changes to take effect.');
  }
}

main().catch(console.error);





