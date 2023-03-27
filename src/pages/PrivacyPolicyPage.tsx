import Head from "next/head";

export function PrivacyPolicyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy</title>
        <meta name="description" content="Privacy policy for our website" />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-4 text-3xl font-bold dark:text-red-500">
          Privacy Policy
        </h1>
        <p className="mb-4">
          This privacy policy sets out how we collect, use, protect and share
          personal information that we obtain from users of our website.
        </p>

        <h2 className="mb-2 text-xl font-semibold">
          Personal Information We Collect
        </h2>
        <p className="mb-4">
          We collect personal information from users who sign up on our website,
          including their name, email address and location. We do not collect
          personal information from users who do not sign up.
        </p>

        <h2 className="mb-2 text-xl font-semibold">
          How We Collect Personal Information
        </h2>
        <p className="mb-4">
          We collect personal information through our sign-up process, which
          requires users to provide their name, email address and location.
        </p>

        <h2 className="mb-2 text-xl font-semibold">
          How We Use Personal Information
        </h2>
        <p className="mb-4">
          We use personal information to improve the user experience on our
          website. Location information is used to display posts from nearby
          users, and email/phone numbers are used as user identification numbers
          (UIDs). Names are displayed on user profiles and posts.
        </p>

        <h2 className="mb-2 text-xl font-semibold">
          Sharing of Personal Information
        </h2>
        <p className="mb-4">
          We do not share personal information with any third parties.
        </p>

        <h2 className="mb-2 text-xl font-semibold">
          How We Protect Personal Information
        </h2>
        <p className="mb-4">
          We store personal information in a secure database to protect it from
          unauthorized access or disclosure.
        </p>

        <h2 className="mb-2 text-xl font-semibold">
          How Long We Keep Personal Information
        </h2>
        <p className="mb-4">
          We keep personal information for as long as the user&apos;s account
          remains active. Users can delete their account at any time.
        </p>

        <h2 className="mb-2 text-xl font-semibold">User Rights</h2>
        <p className="mb-4">
          Users have the right to edit and update their personal information.
          They also have the right to request the deletion of their account,
          which will result in the deletion of all personal information
          associated with their account.
        </p>

        <h2 className="mb-2 text-xl font-semibold">
          Handling Data Breaches or Security Incidents
        </h2>
        <p className="mb-4">
          In the event of a data breach or security incident, we will contact
          local law enforcement authorities and take appropriate measures to
          mitigate any harm to affected users.
        </p>

        <p className="mb-4">
          If you have any questions or concerns about our privacy policy, please
          contact us at abhishek@angira.net.
        </p>
      </div>
    </>
  );
}
