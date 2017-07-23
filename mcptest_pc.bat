:again
curl http://localhost:3000/mcp/submitjob/Time-%time%
echo Waiting for 10s before submitted the next job
sleep 10
goto again
