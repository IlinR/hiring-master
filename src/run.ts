import Executor, { IExecutor } from './Executor';
import ITask from './Task';

export default async function run(executor: IExecutor, queue: AsyncIterable<ITask>, maxThreads = 0) {
    maxThreads = Math.max(0, maxThreads)
    const promisesCount:any = [] 
    let threads = maxThreads
    const WaitingQueue: ITask = [] 
    const queues = new Map();
    const activeTasks = [] as Promise<void>[]
    let lounched = 0
    let tasks = 0
    const runTask = async (task: ITask) => {
        activeTasks[task.targetId] = executor.executeTask(task)
        if (queues.has(task.targetId))
            if (queues.get(task.targetId).length)
                {
                    activeTasks[task.targetId].then(() => {let t=queues.get(task.targetId).shift()
                        runTask(t)
                    })
                    return
                }
        
        
        activeTasks[task.targetId].then(() => {activeTasks.splice(task.targetId,1)
            threads++
        })
        
        
    }
    for await (const task of queue) {
        if (!activeTasks[task.targetId])
            {
                if (threads>0 || maxThreads==0){
                    runTask(task)
                    threads--
                }
                else {
                    console.log(threads)
                    while(threads<1)
                        {
                            await Promise.all(activeTasks)
                        }
                        runTask(task)
                        threads--
                }
            }
        else {
            if (!queues.has(task.targetId))
                queues.set(task.targetId,[])
            queues.get(task.targetId).push(task)
            if (queues.get(task.targetId).length==1)
                activeTasks[task.targetId].then(()=>{runTask(queues.get(task.targetId).shift())})
        }
        
    }
    console.log(maxThreads)
    return Promise.all(activeTasks)

}
