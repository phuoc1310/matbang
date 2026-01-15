import admin from "firebase-admin";

export async function getActiveUsers(req, res) {
  const snapshot = await admin
    .firestore()
    .collection("users")
    .where("email", "!=", null)
    .get();

  const users = snapshot.docs.map(doc => ({
    uid: doc.id,
    email: doc.data().email
  }));

  res.json(users);
}
