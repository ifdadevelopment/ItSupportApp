import * as Yup from "yup";

const generateValidationSchema = (inputFields) => {
  let validationObject = {};

  inputFields.forEach((field) => {
    let schema;

    // Base schema according to field type
    switch (field.type) {
      case "email":
        schema = Yup.string().email("Invalid email");
        break;
      case "date":
        schema = Yup.date();
        if (field.tense === "future") {
          schema = schema.min(new Date(), "Date must be in the future");
        }
        if (field.tense === "past") {
          schema = schema.max(new Date(), "Date must be in the past");
        }
        break;
      case "url":
        schema = Yup.string().url("Please enter a valid URL");
        break;
      case "checkbox":
        schema = Yup.boolean().oneOf(
          [true],
          `You must be ${field.label || field.name}`
        );
        break;
      case "array":
      case "dynamic":
        if (
          ["job_categoery", "sub_categoery", "skill_name"].includes(field.name)
        ) {
          schema = Yup.object();
        } else {
          schema = Yup.array().min(1, "Please select at least one option");
        }
        break;
      case "number":
        schema = Yup.number();
        break;
      default:
        schema = Yup.string();
    }

    // Special rules based on name
    if (field.name === "password2") {
      schema = Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required(`${field.placeholder} is required`);
    }

    if (field.name === "salary") {
      schema = Yup.number().min(5000, "Salary must be at least 5000");
    }

    if (field.name === "experience") {
      schema = Yup.number().max(5, "Experience cannot be more than 5 years");
    }

    // Required rule
    if (field.required && field.type !== "checkbox") {
      schema = schema.required("This field is required");
    }

    validationObject[field.name] = schema;
  });

  return Yup.object().shape(validationObject);
};

export default generateValidationSchema;
