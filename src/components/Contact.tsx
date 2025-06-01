// components/Contact.tsx
export default function Contact() {
  return (
    <section className="text-center my-24 p-16 bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-sm rounded-3xl border border-purple-500/20" id="contact">
      <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Let's Build Something Amazing
      </h2>
      <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
        Ready to bring your ideas to life? Let's connect and create the next big thing together.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <a
          href="mailto:email@shivambajaj.com"
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 hover:scale-105 transition-all duration-300 block cursor-pointer"
        >
          <div className="text-4xl mb-4">📧</div>
          <h4 className="text-lg font-semibold mb-2 text-white">Email</h4>
          <p className="text-gray-300 text-sm">email@shivambajaj.com</p>
        </a>

        <a
          href="https://linkedin.com/in/shivbajaj/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 hover:scale-105 transition-all duration-300 block cursor-pointer"
        >
          <div className="text-4xl mb-4">💼</div>
          <h4 className="text-lg font-semibold mb-2 text-white">LinkedIn</h4>
          <p className="text-gray-300 text-sm">linkedin.com/in/shivbajaj/</p>
        </a>

        <a
          href="https://github.com/shivambajaj5329"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 hover:scale-105 transition-all duration-300 block cursor-pointer"
        >
          <div className="text-4xl mb-4">🐙</div>
          <h4 className="text-lg font-semibold mb-2 text-white">GitHub</h4>
          <p className="text-gray-300 text-sm">github.com/shivambajaj5329</p>
        </a>

        <a
          href="https://twitter.com/shivz2cool"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 hover:scale-105 transition-all duration-300 block cursor-pointer"
        >
          <div className="text-4xl mb-4">🐦</div>
          <h4 className="text-lg font-semibold mb-2 text-white">Twitter</h4>
          <p className="text-gray-300 text-sm">@shivz2cool</p>
        </a>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <a
          href="mailto:email@shivambajaj.com"
          className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-white hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
          <span className="relative flex items-center gap-2">
            <span>🚀</span>
            Start a Project
          </span>
        </a>
      </div>
    </section>
  );
}