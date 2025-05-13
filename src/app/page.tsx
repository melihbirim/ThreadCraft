export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Welcome to ThreadCraft
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Write, schedule, and analyze your X posts with ease
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Write Posts</h2>
          <p className="text-gray-600">
            Compose and edit your X posts with our intuitive editor
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Schedule Posts</h2>
          <p className="text-gray-600">
            Plan and schedule your posts for optimal engagement
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Analyze Performance</h2>
          <p className="text-gray-600">
            Track and analyze your post performance metrics
          </p>
        </div>
      </div>
    </div>
  )
} 