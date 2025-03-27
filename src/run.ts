import Executor, { IExecutor } from './Executor';
import ITask from './Task';

export default async function run(executor: IExecutor, queue: AsyncIterable<ITask>, maxThreads = 0) {
    maxThreads = Math.max(0, maxThreads)
    const promisesCount = [] 
    let threads = maxThreads
    const queues = new Map();
    const activeTasks = [] as Promise<void>[]
    let lounched = 0
    let tasks = 0
    const runTask = async (task: ITask) => {
        lounched++
        // if (!(threads>0 || maxThreads==0))
        //     console.log(threads)
        activeTasks[task.targetId] = executor.executeTask(task)
        threads--
        if (queues.has(task.targetId))
            if (queues.get(task.targetId).length)
                {
                    activeTasks[task.targetId].then(() => runTask(queues.get(task.targetId).shift()))
                    return
                }
        
        
        activeTasks[task.targetId].then(() => {activeTasks.splice(task.targetId,1)
            threads++
        })
        
        
    }
    console.log("maxThreads"+ maxThreads)
    for await (const task of queue) {
        tasks++
        if (!activeTasks[task.targetId])
            {
                if (threads>0 || maxThreads==0){
                    runTask(task)
                }
                else {
                    while(threads>0)
                        {
                            Promise.race(activeTasks)
                        }
                        runTask(task)
                }
            }
        else {
            if (!queues.has(task.targetId))
                queues.set(task.targetId,[])
            queues.get(task.targetId).push(task)
            if (queues.get(task.targetId).length==1)
                activeTasks[task.targetId].then(()=>
            {const tsk = queues.get(task.targetId).shift()
                // if (tsk === undefined)
                //     {
                //         console.log(threads)
                //             console.log(tsk)
                //     }
                runTask(tsk)})
        }
        
    }
    let prom = Promise.all(activeTasks)
    console.log("tasks"+ tasks + "laun" + lounched)
    return prom
}
