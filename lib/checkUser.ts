import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  try {
    const user = await currentUser(); // get the authenticated user

    if (user) {
      const loggedInUser = await db.user.findUnique({
        where: {
          clerkUserId: user?.id, // find logged in user inside the database
        },
        include: {
          transactions: {
            where: {
              type: "CREDIT_PURCHASE",
              createdAt: {
                gte: new Date(
                  new Date().getFullYear(),
                  new Date().getMonth(),
                  1,
                ), // get the latest credit purchase plan along with user details
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      });

      if (loggedInUser) return loggedInUser; // if user exits return user

      const name = `${user?.firstName} ${user?.lastName}`;

      const newUser = await db.user.create({
        // if user does exits create user
        data: {
          clerkUserId: user.id,
          name,
          email: user?.emailAddresses[0].emailAddress,
          imageUrl: user?.imageUrl,
          transactions: {
            create: {
              type: "CREDIT_PURCHASE",
              packageID: "free_user",
              amount: 2,
            },
          },
        },
        include: {
          transactions: true,
        },
      });
      return newUser;
    }
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};
