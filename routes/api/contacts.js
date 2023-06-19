const express = require("express");
const router = express.Router();
const contactController = require("../../controllers/controllersContact");
const { schema } = require("../../models/contact");
const validateBody = require("../../utils/validateBody");


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


router.get("/:contactId", contactController.getContactById);

router.post(
  "/",
  validateBody(schema.contactAddSchema),
  contactController.addContact
);

router.put(
  "/:contactId",
  validateBody(schema.contactAddSchema),
  contactController.updateContact
);

router.patch(
  "/:contactId/favorite",
  validateBody(schema.updateFavoriteSchema),
  contactController.updateFavoriteById
);

router.delete("/:contactId", contactController.deleteContact);

module.exports = router;
