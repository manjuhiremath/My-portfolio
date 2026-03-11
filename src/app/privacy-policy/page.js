import Link from 'next/link';

export const metadata = {
  title: "Privacy Policy | Manjunath M",
  description: "Our Privacy Policy outlines how we collect, use, and protect your information at manjuhiremath.in.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight">
          Privacy Policy
        </h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
          <p className="mb-6">Last updated: March 11, 2026</p>
          
          <p className="mb-6">
            At <strong>manjuhiremath.in</strong>, accessible from https://www.manjuhiremath.in, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by manjuhiremath.in and how we use it.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4">Log Files</h2>
          <p className="mb-6">
            manjuhiremath.in follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services&apos; analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users&apos; movement on the website, and gathering demographic information.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4">Cookies and Web Beacons</h2>
          <p className="mb-6">
            Like any other website, manjuhiremath.in uses &apos;cookies&apos;. These cookies are used to store information including visitors&apos; preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users&apos; experience by customizing our web page content based on visitors&apos; browser type and/or other information.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4">Google DoubleClick DART Cookie</h2>
          <p className="mb-6">
            Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.website.com and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-orange-600">https://policies.google.com/technologies/ads</a>
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4">Privacy Policies</h2>
          <p className="mb-6">
            Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on manjuhiremath.in, which are sent directly to users&apos; browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
          </p>
          <p className="mb-6">
            Note that manjuhiremath.in has no access to or control over these cookies that are used by third-party advertisers.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4">Third Party Privacy Policies</h2>
          <p className="mb-6">
            manjuhiremath.in&apos;s Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4">Children&apos;s Information</h2>
          <p className="mb-6">
            Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
          </p>
          <p className="mb-6">
            manjuhiremath.in does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4">Online Privacy Policy Only</h2>
          <p className="mb-6">
            This Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to the information that they shared and/or collect in manjuhiremath.in. This policy is not applicable to any information collected offline or via channels other than this website.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4">Consent</h2>
          <p className="mb-6">
            By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.
          </p>

          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
            <Link href="/" className="text-orange-600 hover:text-orange-700 font-bold uppercase tracking-wider text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
