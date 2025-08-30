import { exec } from 'child_process';
import chalk from 'chalk';
import readline from 'readline';

// Simple menu system without yargs
function showMenu() {
  console.log(chalk.blue('\n🚀 Robotics Portfolio Manager\n'));
  console.log('1. Start development server (npm run dev)');
  console.log('2. Build project (npm run build)');
  console.log('3. Deploy with version increment (npm run deploy)');
  console.log('4. Run all tests (npm run test:all)');
  console.log('5. Type check (npm run type-check)');
  console.log('6. Lint code (npm run lint)');
  console.log('7. Exit');
  console.log('\nEnter your choice [1-7]:');
}
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function runCommand(commandString, options = {}) {
  console.log(chalk.yellow(`\nExecuting: ${commandString}`));
  const process = exec(commandString, options);

  process.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  process.stderr.on('data', (data) => {
    console.error(chalk.red(data.toString()));
  });

  process.on('close', (code) => {
    if (code === 0) {
      console.log(chalk.green('\n✅ Command completed successfully.'));
      setTimeout(() => {
        showMenu();
        rl.question('', handleChoice);
      }, 1000);
    } else {
      console.log(chalk.red(`\n❌ Command exited with code ${code}`));
      setTimeout(() => {
        showMenu();
        rl.question('', handleChoice);
      }, 1000);
    }
  });

  return process;
}

function handleChoice(choice) {
  const commands = {
    '1': 'npm run dev',
    '2': 'npm run build', 
    '3': 'npm run deploy',
    '4': 'npm run test:all',
    '5': 'npm run type-check',
    '6': 'npm run lint',
    '7': () => {
      console.log(chalk.green('\n👋 Goodbye!'));
      rl.close();
      process.exit(0);
    }
  };

  if (choice === '7') {
    commands['7']();
  } else if (commands[choice]) {
    console.log(chalk.blue(`\n🚀 Running: ${commands[choice]}`));
    runCommand(commands[choice], { cwd: process.cwd() });
  } else {
    console.log(chalk.red('\n❌ Invalid choice. Please enter 1-7.'));
    setTimeout(() => {
      showMenu();
      rl.question('', handleChoice);
    }, 1000);
  }
}

showMenu();
rl.question('', handleChoice);
