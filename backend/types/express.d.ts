import { IUser } from "../models/user.model"; // Apne User Interface ka path adjust karlena

declare global {
  namespace Express {
    // Hum Express ki Request interface ko 'Re-open' karke usme user add kar rahe hain
    interface Request {
      user?: IUser; // Ab TS ko pata hai ki req.user mil sakta hai jo IUser type ka hoga
    }
  }
}