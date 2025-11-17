import * as Yup from "yup";

export const generateArrValidationSchema = (steps) => {
    const shape = {};

    steps.forEach((step) => {
        step.forEach((field) => {
            const isRequired = field.required ?? false; // default false

            switch (field.type) {
                case "text":
                case "textarea":
                   
                        shape[field.key] = isRequired
                            ? Yup.string().required(`${field.label} is required`)
                            : Yup.string().nullable();
                   
                    break;
                case "picker":
                    shape[field.key] = isRequired
                        ? Yup.string().required(`Please select ${field.label}`)
                        : Yup.string().nullable();
                    break;

                case "number":
                    shape[field.key] = isRequired
                        ? Yup.number()
                            .typeError(`${field.label} must be a number`)
                            .positive(`${field.label} must be positive`)
                            .required(`${field.label} is required`)
                        : Yup.number()
                            .typeError(`${field.label} must be a number`)
                            .positive(`${field.label} must be positive`)
                            .nullable();
                    break;

                case "date":
                    shape[field.key] = isRequired
                        ? Yup.date().typeError(`${field.label} must be a valid date`).required(`${field.label} is required`)
                        : Yup.date().nullable();
                    break;

                default:
                    shape[field.key] = isRequired ? Yup.string().required(`${field.label} is required`) : Yup.string().nullable();
            }
        });
    });

    return Yup.object().shape(shape);
};
