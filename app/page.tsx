import CreateEventForm from "@/components/CreateEventForm";
import MyEvents from "@/components/MyEvents";

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center py-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-3">
          Create an Event
        </h1>
        <p className="text-stone-500 text-base max-w-sm mx-auto">
          Set up your event, share the link, and collect RSVPs in minutes.
        </p>
      </div>

      {/* Create Form */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
        <CreateEventForm />
      </div>

      {/* Events created on this browser */}
      <MyEvents />
    </div>
  );
}
