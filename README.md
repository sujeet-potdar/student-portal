**1. Project Overview**
The Student Portal is a web application designed to bridge the gap between academic institutions and students. It allows institutions to post academic opportunities (projects, internships, research positions) and allows students to apply for them based on their eligibility.

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**2. Functional Features**
A. Authentication & User Roles
The system utilizes Supabase Auth to handle secure user authentication. Upon registration, users are assigned a role (Student or Admin). This role dictates which parts of the application they can access.

B. Student Workflow
View Opportunities: Students browse a list of available opportunities.

Eligibility Check: The application automatically compares the student’s profile CGPA against the opportunity's requirement.

Application: Eligible students can apply.

Status Tracking: Students view the status of their applications (Pending, Accepted, Rejected) in their dashboard.

C. Administrator Workflow
Dashboard: Admins access a specific panel to manage the portal.

Create Opportunities: Admins add new opportunities with details such as title, description, required CGPA, and deadline.

Application Management: Admins review submitted applications and update their statuses.

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
**3. Technical Implementation**
Frontend: Built using React with Vite for fast bundling, and styled using Tailwind CSS for responsive design. Components are structured using Shadcn/ui for a modern look and feel.

Backend & Database: Supabase acts as the backend-as-a-service, handling:

PostgreSQL Database: Storing user profiles, opportunities, and applications.

Authentication: Email/password sign-in.

Row Level Security (RLS): Ensuring students can only see their own applications, while admins can see all.

