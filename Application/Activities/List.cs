using MediatR;
using System.Collections.Generic;
using Domain;
using System.Threading.Tasks;
using System.Threading;
using Persistence;
using Microsoft.EntityFrameworkCore;
using AutoMapper;

namespace Application.Activities
{
    public class List
    {
        public class Query : IRequest<List<ActivityDto>> { }
        public class Handler : IRequestHandler<Query, List<ActivityDto>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;

            // private readonly ILogger<List> _logger;
            public Handler(DataContext context, IMapper mapper/* , ILogger<List> logger */)
            {
                // _logger = logger;
                _context = context;
                _mapper = mapper;
            }

            public async Task<List<ActivityDto>> Handle(Query request, CancellationToken cancellationToken)
            {
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
                var activities = await _context.Activities.ToListAsync();

                return _mapper.Map<List<Activity>, List<ActivityDto>>(activities);
            }
        }
    }
}