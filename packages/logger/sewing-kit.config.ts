import {createPackage} from '@sewing-kit/config';
import {dialogPackage} from '../../config/sewing-kit';

export default createPackage((pkg) => {
  pkg.entry({root: './src/index'});
  pkg.use(dialogPackage());
});
