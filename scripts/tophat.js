const {resolve} = require('path');

const {config, exec, cp, mkdir, rm, echo, exit} = require('shelljs');

const root = resolve(__dirname, '..');
const projectDir = process.argv[2];

config.fatal = true;
const logBreak = () => {
  echo(' ');
};
const log = (text) => {
  echo(`  ${text}`);
};
const logDivder = () => {
  logBreak();
  echo('-----');
  logBreak();
};
const logHeader = (header) => {
  echo(`/ ${header}`);
  logBreak();
};

const SCOPE = '@cartogram';
const PREFIX = 'dialog-';
const LOCAL_PACKAGE_DIR = 'packages';

if (!projectDir) {
  log(
    'A target project directory is required. `yarn tophat PROJECT_DIRECTORY`',
  );
  exit(1);
}

const DEST_PACKAGE_DIR = resolve(root, `../../${projectDir}/node_modules/`);

const files = [
  {name: 'dialog', scope: true, prefix: false},
  {
    name: 'logger',
    scope: true,
    prefix: true,
  },
  {
    name: 'core',
    scope: true,
    prefix: true,
  },
  {
    name: 'server',
    scope: true,
    prefix: true,
  },
  {
    name: 'ui',
    scope: true,
    prefix: true,
  },
];

log('building project...');
exec('yarn run build');

logBreak();
files.forEach(({name, scope, prefix}) => {
  logHeader(name);

  const source = resolve(LOCAL_PACKAGE_DIR, name);
  const destination = scope
    ? resolve(DEST_PACKAGE_DIR, SCOPE)
    : resolve(DEST_PACKAGE_DIR);
  const destinationPackage = prefix
    ? resolve(destination, `${PREFIX}${name}`)
    : resolve(destination, name);

  log(`Removing ${destinationPackage}...`);
  rm('-rf', destinationPackage);

  log(`Creating new build directory at ${destination}...`);
  mkdir('-p', destination);

  log('Copying build to node_modules...');
  cp('-R', source, destinationPackage);

  log('Success!');
  logDivder();
});

logBreak();
log('Build copied to consuming project. ');
