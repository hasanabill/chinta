import Timeline from "./Timeline"


const Home = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-100">
            <section className="max-w-7xl mx-auto px-4 pt-8 pb-6">
                <div className="rounded-3xl overflow-hidden border border-emerald-100 shadow-lg bg-white">
                    <div className="bg-gradient-to-r from-[#009c51] via-emerald-500 to-lime-400 px-6 md:px-10 py-10 text-white">
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                            Discover Meaningful Discussions
                        </h1>
                        <p className="mt-3 text-white/90 max-w-2xl">
                            Explore community conversations, follow voices you care about, and join threads that matter.
                        </p>
                    </div>
                </div>
            </section>

            <Timeline />
        </div>
    )
}

export default Home