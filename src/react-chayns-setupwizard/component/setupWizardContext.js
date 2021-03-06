import { createContext } from 'react';

const SetupWizardContext = createContext({
    enabledSteps: [],
    completedSteps: [],
    requiredSteps: [],
    currentStep: -1,
    contentStyle: null,
    stepComplete: null,
    stepEnabled: null,
    stepRequired: null,
    previousStep: null,
    nextStep: null,
    toStep: null,
    resetToStep: null,
    notComplete: null,
});

export default SetupWizardContext;
