import { schedule } from "node-cron"
import { persistData } from "./persistData.cron.js"

export const initSchedular = () =>{
	schedule("*/10 * * * *", persistData);
} 
