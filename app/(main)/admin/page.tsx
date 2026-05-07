import {
  getAllPendingPayouts,
  getPendingDoctors,
  getVerifiedDoctors,
} from "@/actions/admin";
import { TabsContent } from "@/components/ui/tabs";
import PendingDoctors from "./_components/PendingDoctors";
import VerifiedDoctors from "./_components/VerifiedDoctors";
import PendingPayouts from "./_components/PendingPayouts";

const AdminPage = async () => {
  const [pendingDoctors, verifiedDoctors, pendingPayouts] = await Promise.all([
    getPendingDoctors(),
    getVerifiedDoctors(),
    getAllPendingPayouts(),
  ]);

  return (
    <div className="col-span-3">
      <TabsContent value="pending">
        <PendingDoctors doctors={pendingDoctors.doctors || []} />
      </TabsContent>
      <TabsContent value="doctors">
        <VerifiedDoctors doctors={verifiedDoctors.doctors || []} />
      </TabsContent>
      <TabsContent value="payouts">
        <PendingPayouts payouts={pendingPayouts?.payouts || []} />
      </TabsContent>
    </div>
  );
};

export default AdminPage;
