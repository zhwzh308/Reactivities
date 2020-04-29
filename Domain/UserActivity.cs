using System;

namespace Domain
{
    public class UserActivity
    {
        // Entity is convention-based naming, AppUser and AppUserId automatically linked
        public string AppUserId { get; set; }
        public virtual AppUser AppUser { get; set; }
        // Same here
        public Guid ActivityId { get; set; }
        public virtual Activity Activity { get; set; }
        public DateTime DateJoined { get; set; }
        public bool IsHost { get; set; }
    }
}