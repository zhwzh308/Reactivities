import { IActivity, IAttendee } from "../../models/activity";
import { IUser } from "../../models/user";

export const combineDateAndTime = (date: Date, time: Date) => {
    const timeString = time.getHours() + ':' + time.getMinutes() + ":00";
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateString = `${year}-${month}-${day}`;
    return new Date(dateString + ' ' + timeString)
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