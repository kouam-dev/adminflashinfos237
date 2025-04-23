import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    query, 
    where,  
    setDoc,
    updateDoc, 
    deleteDoc, 
    orderBy, 
    limit,
    serverTimestamp,
  } from 'firebase/firestore';
  import { 
    createUserWithEmailAndPassword, 
    updateProfile, 
    updateEmail, 
    deleteUser,
    sendPasswordResetEmail,
    User as FirebaseUser
  } from 'firebase/auth';
  import { db, auth } from '@/config/firebase';
  import { User, UserRole, UserFormData } from '@/types/user';
  
  // Collection reference
  const usersCollection = collection(db, 'users');
  
  // Convert Firestore data to User object
  const convertToUser = (doc: any): User => {
    const data = doc.data();
    return {
      id: doc.id,
      email: data.email,
      displayName: data.displayName,
      firstName: data.firstName,
      lastName: data.lastName,
      photoURL: data.photoURL,
      role: data.role,
      bio: data.bio,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastLoginAt: data.lastLoginAt?.toDate(),
      active: data.active,
      articlesCount: data.articlesCount || 0,
      social: data.social
    };
  };
  
  // Get all users
  export const getAllUsers = async (): Promise<User[]> => {
    const querySnapshot = await getDocs(query(usersCollection, orderBy('createdAt', 'desc')));
    return querySnapshot.docs.map(convertToUser);
  };
  
  // Get user by ID
  export const getUserById = async (userId: string): Promise<User | null> => {
    const docRef = doc(usersCollection, userId);
    const docSnap = await getDoc(docRef);
    
    
    if (docSnap.exists()) {
      return convertToUser(docSnap);
    }
    
    return null;
  };
  
  // Get users by role
  export const getUsersByRole = async (role: UserRole): Promise<User[]> => {
    const q = query(usersCollection, where("role", "==", role));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertToUser);
  };
  
  // Create new user
  export const createUser = async (userData: UserFormData): Promise<User> => {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password || '');
      const firebaseUser = userCredential.user;
      
      // Update profile
      await updateProfile(firebaseUser, {
        displayName: userData.displayName,
        photoURL: userData.photoURL
      });
      
      // Create user document in Firestore
      const newUser = {
        email: userData.email,
        displayName: userData.displayName,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        photoURL: userData.photoURL || '',
        role: userData.role,
        bio: userData.bio || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        active: userData.active,
        articlesCount: 0,
        social: userData.social || {}
      };
      
      const docRef = doc(usersCollection, firebaseUser.uid);
      await setDoc(docRef, newUser);
      
      return {
        id: firebaseUser.uid,
        ...newUser,
        createdAt: new Date(),
        updatedAt: new Date()
      } as User;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  };
  
  // Update user
  export const updateUser = async (userId: string, userData: Partial<UserFormData>): Promise<void> => {
    try {
      const userRef = doc(usersCollection, userId);
      
      // Update data object
      const updateData: any = {
        ...userData,
        updatedAt: serverTimestamp()
      };
      
      // Remove password from Firestore update
      if (updateData.password) {
        delete updateData.password;
      }
      
      // Update Firestore document
      await updateDoc(userRef, updateData);
      
      // If email is being updated, update in Firebase Auth
      const currentUser = auth.currentUser;
      if (userData.email && currentUser && currentUser.uid === userId) {
        await updateEmail(currentUser, userData.email);
      }
      
      // If display name or photo URL is being updated, update in Firebase Auth
      if ((userData.displayName || userData.photoURL) && currentUser && currentUser.uid === userId) {
        await updateProfile(currentUser, {
          displayName: userData.displayName || currentUser.displayName,
          photoURL: userData.photoURL || currentUser.photoURL
        });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };
  
  // Delete user
  export const deleteUserAccount = async (userId: string): Promise<void> => {
    try {
      // Delete from Firestore
      const userRef = doc(usersCollection, userId);
      await deleteDoc(userRef);
      
      // Delete from Firebase Auth
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === userId) {
        await deleteUser(currentUser);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };
  
  // Change user role
  export const changeUserRole = async (userId: string, newRole: UserRole): Promise<void> => {
    const userRef = doc(usersCollection, userId);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: serverTimestamp()
    });
  };
  
  // Toggle user active status
  export const toggleUserActiveStatus = async (userId: string, active: boolean): Promise<void> => {
    const userRef = doc(usersCollection, userId);
    await updateDoc(userRef, {
      active: active,
      updatedAt: serverTimestamp()
    });
  };
  
  // Send password reset email
  export const sendPasswordReset = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  };
  
  // Get users with pagination
  export const getPaginatedUsers = async (pageSize: number, lastVisible?: any): Promise<{users: User[], lastVisible: any}> => {
    let q;
    
    if (lastVisible) {
      q = query(usersCollection, orderBy('createdAt', 'desc'), limit(pageSize), where('createdAt', '<', lastVisible));
    } else {
      q = query(usersCollection, orderBy('createdAt', 'desc'), limit(pageSize));
    }
    
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map(convertToUser);
    
    const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1]?.data().createdAt || null;
    
    return {
      users,
      lastVisible: newLastVisible
    };
  };
  
  // Search users
  export const searchUsers = async (searchTerm: string): Promise<User[]> => {
    // Firebase doesn't support native text search, so we're doing a simple startsWith query
    // For more complex search, consider using a third-party solution like Algolia
    const nameQ = query(usersCollection, where("displayName", ">=", searchTerm), where("displayName", "<=", searchTerm + "\uf8ff"));
    const emailQ = query(usersCollection, where("email", ">=", searchTerm), where("email", "<=", searchTerm + "\uf8ff"));
    
    const [nameSnapshot, emailSnapshot] = await Promise.all([
      getDocs(nameQ),
      getDocs(emailQ)
    ]);
    
    // Combine results and remove duplicates
    const users = new Map<string, User>();
    
    nameSnapshot.docs.forEach(doc => {
      users.set(doc.id, convertToUser(doc));
    });
    
    emailSnapshot.docs.forEach(doc => {
      users.set(doc.id, convertToUser(doc));
    });
    
    return Array.from(users.values());
  };