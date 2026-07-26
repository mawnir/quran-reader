import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div>
            <div className='flex items-center justify-center text-4xl h-full w-full'>
                About
            </div>
        </div>
    )
}
