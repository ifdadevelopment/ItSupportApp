export const generateArrInitialValues = (steps) => {
    const initialValues = {};
    steps.forEach((step) => {
        step.forEach((field) => {
            if (field.type === "picker") {
                initialValues[field.key] = field.options?.[0]?.label || "";
            } else if (field.type === "number") {
                initialValues[field.key] = "";
            } else {
                initialValues[field.key] = "";
            }
        });
    });
    return initialValues;
};
