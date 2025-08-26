/**
 * Testing and QA Agents - Comprehensive automated testing and deployment system
 * 
 * This module provides a complete suite of agents for:
 * - Quality Assurance testing
 * - Build verification 
 * - Safe deployment with rollback capabilities
 */
export { QAAgent, runQATests } from './qa-agent';
export { BuildAgent, runBuildVerification } from './build-agent';
export { DeployAgent, runSafeDeployment } from './deploy-agent';
/**
 * Run all agents in sequence for complete verification
 */
export async function runCompleteValidation(projectRoot?: string) {
  console.log('🤖 Starting Complete Validation Pipeline...\n');
  const results = {
    qa: null as any,
    build: null as any,
    timestamp: new Date().toISOString(),
    overallSuccess: false
  };
  try {
    // Run QA tests
    console.log('Step 1/2: QA Testing');
    const { runQATests } = await import('./qa-agent');
    results.qa = await runQATests(projectRoot);
    if (!results.qa.overallPassed) {
      console.log(' QA tests failed. Stopping validation pipeline.');
      return results;
    }
    // Run build verification
    console.log('\nStep 2/2: Build Verification');
    const { runBuildVerification } = await import('./build-agent');
    results.build = await runBuildVerification(projectRoot);
    if (!results.build.buildSuccess) {
      console.log(' Build verification failed. Stopping validation pipeline.');
      return results;
    }
    results.overallSuccess = true;
    console.log('\n' + '='.repeat(60));
    console.log(' COMPLETE VALIDATION SUCCESS');
    console.log('='.repeat(60));
    console.log(' QA Tests: PASSED');
    console.log(' Build Verification: PASSED');
    console.log(' Ready for deployment!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error(' Validation pipeline failed:', error);
  }
  return results;
}
/**
 * Utility function to check if the project is ready for deployment
 */
export async function isReadyForDeployment(projectRoot?: string): Promise<boolean> {
  try {
    const results = await runCompleteValidation(projectRoot);
    return results.overallSuccess;
  } catch {
    return false;
  }
}
