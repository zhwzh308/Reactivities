import { IActivity, IAttendee } from "../../models/activity";
import { IUser } from "../../models/user";

export const combineDateAndTime = (date: Date, time: Date) => {
    const timeString = time.toISOString().split('T')[1];
    const dateString = date.toISOString().split('T')[0];
    return new Date(dateString + 'T' + timeString)
}

export const setActivityProps = (a: IActivity, user: IUser) => {
    a.date = new Date(a.date);
    a.isGoing = a.attendees.some(a => a.username === user?.username);
    a.isHost = a.attendees.some(a => a.username === user?.username && a.isHost);
    return a;
}

export const createAttendee = (user: IUser) : IAttendee => {
    return {
        displayName: user.displayName,
        isHost: false,
        username: user.username,
        image: user.image!
    }
};