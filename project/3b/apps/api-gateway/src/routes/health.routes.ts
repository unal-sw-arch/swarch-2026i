import { Router } from 'express';
import { ROUTES } from '../shared/constants/routes';

export const healthRouter = Router();

healthRouter.get(ROUTES.health, (_req, res) => {
	res.status(200).json({ status: 'ok' });
});
