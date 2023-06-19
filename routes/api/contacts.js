const express = require("express");

const ctrl = require("../../controllers/controllersContact");

const { schema } = require("../../models/contact");

const { isValidId, authenticate } = require("../../middlewares");

const validateBody = require("../../utils/validateBody");


const router = express.Router();

router.get("/", authenticate, ctrl.listContact);

router.get("/", contactController.listContact);
const contactAddSchema = Joi.object({
  name: Joi.string()
    .required()
    .messages({ "any.required": `missing required name field` }),
  email: Joi.string()
    .required()
    .messages({ "any.required": `missing required email field` }),
  phone: Joi.string()
    .required()
    .messages({ "any.required": `missing required phone field` }),
});


router.get("/:contactId", authenticate, isValidId, ctrl.getContactById);

router.post(
  "/",
  authenticate,
  validateBody(schema.contactAddSchema),
  ctrl.addContact
);

router.put(
  "/:contactId",
  authenticate,
  isValidId,
  validateBody(schema.contactAddSchema),
  ctrl.updateContact
);

router.patch(
  "/:contactId/favorite",
  authenticate,
  isValidId,
  validateBody(schema.updateFavoriteSchema),
  ctrl.updateFavoriteById
);

router.delete("/:contactId", authenticate, isValidId, ctrl.deleteContact);

module.exports = router;