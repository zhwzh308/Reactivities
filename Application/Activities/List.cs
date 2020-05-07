using MediatR;
using System.Collections.Generic;
using Domain;
using System.Threading.Tasks;
using System.Threading;
using Persistence;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using System.Linq;
using System;
using Application.Interfaces;

namespace Application.Activities
{
    public class List
    {
        public class ActivitiesEnvelope
        {
            public List<ActivityDto> Activities { get; set; }
            public int ActivityCount { get; set; }
        }
        public class Query : IRequest<ActivitiesEnvelope>
        {
            public Query(int? limit, int? offset, bool isGoing, bool isHost, DateTime? startDate)
            {
                Limit = limit;
                Offset = offset;
                IsGoing = isGoing;
                IsHost = isHost;
                StartDate = startDate ?? DateTime.UtcNow;
            }
            public int? Limit { get; set; }
            public int? Offset { get; set; }
            public bool IsGoing { get; set; }
            public bool IsHost { get; set; }
            public DateTime StartDate { get; set; }
        }
        public class Handler : IRequestHandler<Query, ActivitiesEnvelope>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;
            private readonly IUserAccessor _userAccessor;

            // private readonly ILogger<List> _logger;
            public Handler(DataContext context, IMapper mapper,/* , ILogger<List> logger */ IUserAccessor userAccessor)
            {
                // _logger = logger;
                _context = context;
                _mapper = mapper;
                _userAccessor = userAccessor;
            }

            public async Task<ActivitiesEnvelope> Handle(Query request, CancellationToken cancellationToken)
            {
                var queryable = _context.Activities
                .Where(x => x.Date >= request.StartDate)
                .OrderBy(x => x.Date)
                .AsQueryable();
                /*
                try
                {
                    for(var i = 0; i < 10; i++)
                    {
                        cancellationToken.ThrowIfCancellationRequested();
                        await Task.Delay(1000, cancellationToken);
                        _logger.LogInformation($"Task {i} has completed");
                    }
                }
                catch (System.Exception ex) when (ex is TaskCanceledException)
                {
                    _logger.LogInformation("Task was cancelled");
                } */
                var username = _userAccessor.GetCurrentUsername();
                if (request.IsGoing && (!request.IsHost))
                {
                    queryable = queryable.Where(x => x.UserActivities.Any(a => a.AppUser.UserName == username));
                }
                if (request.IsHost && (!request.IsGoing))
                {
                    queryable = queryable.Where(x => x.UserActivities.Any(a => a.AppUser.UserName == username && a.IsHost));
                }
                var activities = await queryable
                .Skip(request.Offset ?? 0)
                .Take(request.Limit ?? 3)
                .ToListAsync();

                return new ActivitiesEnvelope
                {
                    Activities = _mapper.Map<List<Activity>, List<ActivityDto>>(activities),
                    ActivityCount = queryable.Count()
                };
            }
        }
    }
}