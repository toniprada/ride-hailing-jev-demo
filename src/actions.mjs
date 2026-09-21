export async function randomizeAndEvaluate({isBusy,validate,randomize,evaluate,onError}){if(isBusy())return;try{validate();randomize();await evaluate();}catch(error){onError(error);}}
