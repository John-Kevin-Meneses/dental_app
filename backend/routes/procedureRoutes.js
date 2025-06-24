// routes/procedureRoutes.js
const express = require('express');
const router = express.Router();
const procedureController = require('../controllers/procedureController');

router.get('/', procedureController.getProcedures);
router.get('/:id', procedureController.getProcedureById);
router.post('/', procedureController.createProcedure);
router.put('/:id', procedureController.updateProcedure);
router.delete('/:id', procedureController.deleteProcedure);
router.get('/duration/range', procedureController.getProceduresByDuration);

module.exports = router;