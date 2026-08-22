import { Router } from 'express';
import { getCities, getCountries, getCityById } from '../controllers/cityController.js';

const router = Router();

router.get('/', getCities);
router.get('/countries', getCountries);
router.get('/:id', getCityById);

export default router;
