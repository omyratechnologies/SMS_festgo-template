// Template verification script
const name = "Test User";
const regNo = "RBG-12345";

const message = `Dear ${name},your Reg no:${regNo}.You are registered for FESTGO EVENTS- (RBG PALNADU CHAPTER LAUNCH) 21st Sep, 9:30AM @ SNR Convention, NRT. Lunch follows."RBG TEAM PALNADU" Location-https://stiny.in/FESTGO/loc`;

console.log("Generated Message:");
console.log(message);
console.log("\nApproved Template:");
console.log("Dear {#var#},your Reg no:{#var#}.You are registered for FESTGO EVENTS- (RBG PALNADU CHAPTER LAUNCH) 21st Sep, 9:30AM @ SNR Convention, NRT. Lunch follows.\"RBG TEAM PALNADU\" Location-https://stiny.in/FESTGO/loc");
console.log("\nTemplate Match Check:");

const template = "Dear {#var#},your Reg no:{#var#}.You are registered for FESTGO EVENTS- (RBG PALNADU CHAPTER LAUNCH) 21st Sep, 9:30AM @ SNR Convention, NRT. Lunch follows.\"RBG TEAM PALNADU\" Location-https://stiny.in/FESTGO/loc";
const expectedMessage = template.replace('{#var#}', name).replace('{#var#}', regNo);

console.log("✅ Messages match:", message === expectedMessage);
console.log("✅ URL format correct:", message.includes("https://stiny.in/FESTGO/loc"));