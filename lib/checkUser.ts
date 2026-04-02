import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  try {
    const user = await currentUser();

    if (user) {
      const loggedInUser = await db.user.findUnique({
        where: {
          clerkUserId: user?.id,
        },
      });

      if (loggedInUser) return loggedInUser;

      const name = `${user?.firstName} ${user?.lastName}`;

      const newUser = await db.user.create({
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
      });
      return newUser;
    }
    return null;
  } catch (error) {
    console.log(error);
  }
};
