import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();
const userController = new UserController();

/**
 * @route   GET /api/v1/users
 * @desc    Get all users
 * @access  Public
 */
router.get('/', userController.getAllUsers);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Public
 */
router.get('/:id', userController.getUserById);

/**
 * @route   POST /api/v1/users
 * @desc    Create a new user
 * @access  Public
 * @body    { name }
 */
router.post('/', userController.createUser);

export default router;

