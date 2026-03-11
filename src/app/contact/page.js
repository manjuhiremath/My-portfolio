import Link from 'next/link';
import { FiMail, FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';

export const metadata = {
  title: "Contact Us | Manjunath M",
  description: "Get in touch with Manjunath M for inquiries, feedback, or collaborations.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight">
          Contact Us
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              Have a question, feedback, or want to collaborate? We&apos;d love to hear from you. Use the information below to get in touch with us.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl">
                  <FiMail className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Email</h3>
                  <p className="text-slate-600 dark:text-slate-400">manjunathmhiremath@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl">
                  <FiLinkedin className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">LinkedIn</h3>
                  <a href="https://linkedin.com/in/manjunath-m-hiremath" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
                    linkedin.com/in/manjunath-m-hiremath
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl">
                  <FiGithub className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">GitHub</h3>
                  <a href="https://github.com/Manjunath-Hiremath" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
                    github.com/Manjunath-Hiremath
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Send a Message</h2>
            <form className="space-y-4" action="mailto:manjunathmhiremath@gmail.com" method="post" encType="text/plain">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input type="text" name="name" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-orange-500 transition-colors dark:text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input type="email" name="email" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-orange-500 transition-colors dark:text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
                <textarea name="message" rows="4" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:border-orange-500 transition-colors dark:text-white" required></textarea>
              </div>
              <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors uppercase tracking-widest text-sm">
                Send Message
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800">
          <Link href="/" className="text-orange-600 hover:text-orange-700 font-bold uppercase tracking-wider text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
