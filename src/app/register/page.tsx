'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';
import { generateApplicationNumber } from '@/lib/utils';
import { RegistrationFormData } from '@/types/student';
import { UserPlus, CheckCircle, AlertCircle, Upload, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    fatherName: '',
    motherName: '',
    dob: '',
    gender: 'Male',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    category: 'OPEN',
    address: '',
    district: '',
    state: 'Maharashtra',
    sscBoard: '',
    sscPassingYear: '',
    sscPercentage: '',
    hscBoard: '',
    hscPassingYear: '',
    hscPercentage: '',
    domicileNumber: '',
    photoFile: null,
  });

  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ applicationNumber: string; email: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setError('Photo size should be less than 2MB');
        return;
      }
      setFormData((prev) => ({ ...prev, photoFile: file }));
      setPreviewPhoto(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form Validations
    if (
      !formData.fullName ||
      !formData.fatherName ||
      !formData.motherName ||
      !formData.dob ||
      !formData.mobile ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.address ||
      !formData.district ||
      !formData.state ||
      !formData.sscBoard ||
      !formData.sscPassingYear ||
      !formData.sscPercentage ||
      !formData.hscBoard ||
      !formData.hscPassingYear ||
      !formData.hscPercentage ||
      !formData.domicileNumber
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Mobile number validation (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobile)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Password validation (at least 8 chars)
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!formData.photoFile) {
      setError('Please upload student photo.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Upload Photo to Firebase Storage
      let photoUrl = '';
      if (formData.photoFile) {
        const fileExt = formData.photoFile.name.split('.').pop() || 'jpg';
        const storageRef = ref(storage, `student_photos/${user.uid}_${Date.now()}.${fileExt}`);
        const uploadSnapshot = await uploadBytes(storageRef, formData.photoFile);
        photoUrl = await getDownloadURL(uploadSnapshot.ref);
      }

      // 3. Generate unique application number
      const appNumber = generateApplicationNumber();

      // 4. Save to Firestore
      const studentData = {
        applicationNumber: appNumber,
        userId: user.uid,
        fullName: formData.fullName,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        dob: formData.dob,
        gender: formData.gender,
        mobile: formData.mobile,
        email: formData.email,
        category: formData.category,
        address: formData.address,
        district: formData.district,
        state: formData.state,
        sscBoard: formData.sscBoard,
        sscPassingYear: formData.sscPassingYear,
        sscPercentage: formData.sscPercentage,
        hscBoard: formData.hscBoard,
        hscPassingYear: formData.hscPassingYear,
        hscPercentage: formData.hscPercentage,
        domicileNumber: formData.domicileNumber,
        photoUrl: photoUrl,
        status: 'SUBMITTED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'applications', user.uid), studentData);

      setSuccessInfo({
        applicationNumber: appNumber,
        email: formData.email,
      });
    } catch (err: unknown) {
      console.error('Registration error:', err);
      const authError = err as { code?: string; message?: string };
      if (authError.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please use login or register with a different email.');
      } else {
        setError(authError.message || 'Registration failed. Please check your network or try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (successInfo) {
    return (
      <div className="max-w-2xl mx-auto my-8 bg-white p-8 rounded-lg shadow-md border-t-4 border-emerald-600 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Registration Successful!</h2>
        <p className="text-slate-600">
          Your admission application has been registered successfully on the State Common Entrance Test Cell Portal.
        </p>

        <div className="bg-slate-50 border border-slate-200 p-6 rounded-md text-left space-y-3 my-4">
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500 text-sm">Application Number:</span>
            <span className="font-bold text-blue-800 text-lg">{successInfo.applicationNumber}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500 text-sm">Registered Email:</span>
            <span className="font-medium text-slate-800">{successInfo.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Application Status:</span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800">
              SUBMITTED
            </span>
          </div>
        </div>

        <div className="p-4 bg-blue-50 text-blue-800 text-xs rounded border border-blue-200">
          Please note down your Application Number for future reference. You can login to your candidate portal anytime to view details.
        </div>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            href="/student/login"
            className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-6 py-2.5 rounded-md text-sm transition-colors"
          >
            Proceed to Candidate Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-amber-500" /> New Student Registration Form
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fill in all required details carefully. Fields marked with <span className="text-red-500">*</span> are mandatory.
          </p>
        </div>
        <Link href="/" className="text-xs text-blue-700 hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-8">
        {/* Section 1: Personal Details */}
        <div>
          <h2 className="text-md font-bold text-blue-800 border-b border-blue-100 pb-2 mb-4 uppercase tracking-wider text-xs">
            1. Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Candidate Full Name"
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Father&apos;s Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                placeholder="Father's Full Name"
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mother&apos;s Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="motherName"
                value={formData.motherName}
                onChange={handleChange}
                placeholder="Mother's Full Name"
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="OPEN">OPEN / General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
                <option value="NT">NT / VJ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Account Security */}
        <div>
          <h2 className="text-md font-bold text-blue-800 border-b border-blue-100 pb-2 mb-4 uppercase tracking-wider text-xs">
            2. Contact &amp; Account Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                maxLength={10}
                placeholder="10 digit mobile number"
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="candidate@example.com"
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password <span className="text-red-500">* (min 8 chars)</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Address & Domicile */}
        <div>
          <h2 className="text-md font-bold text-blue-800 border-b border-blue-100 pb-2 mb-4 uppercase tracking-wider text-xs">
            3. Address &amp; Domicile Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Residential Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                placeholder="Complete postal address"
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                District <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="District Name"
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Domicile Certificate Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="domicileNumber"
                value={formData.domicileNumber}
                onChange={handleChange}
                placeholder="e.g. DOM-2024-XXXX"
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 4: Qualification Details (SSC & HSC) */}
        <div>
          <h2 className="text-md font-bold text-blue-800 border-b border-blue-100 pb-2 mb-4 uppercase tracking-wider text-xs">
            4. Educational Qualifications
          </h2>

          {/* SSC */}
          <div className="bg-slate-50 p-4 rounded border border-slate-200 mb-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase">SSC (10th) Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SSC Board <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="sscBoard"
                  value={formData.sscBoard}
                  onChange={handleChange}
                  placeholder="e.g. Maharashtra State Board"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SSC Passing Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="sscPassingYear"
                  value={formData.sscPassingYear}
                  onChange={handleChange}
                  placeholder="e.g. 2022"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SSC Percentage (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="sscPercentage"
                  value={formData.sscPercentage}
                  onChange={handleChange}
                  placeholder="e.g. 88.50"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* HSC */}
          <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase">HSC (12th) Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  HSC Board <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hscBoard"
                  value={formData.hscBoard}
                  onChange={handleChange}
                  placeholder="e.g. Maharashtra State Board"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  HSC Passing Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hscPassingYear"
                  value={formData.hscPassingYear}
                  onChange={handleChange}
                  placeholder="e.g. 2024"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  HSC Percentage (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hscPercentage"
                  value={formData.hscPercentage}
                  onChange={handleChange}
                  placeholder="e.g. 85.20"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Student Photo Upload */}
        <div>
          <h2 className="text-md font-bold text-blue-800 border-b border-blue-100 pb-2 mb-4 uppercase tracking-wider text-xs">
            5. Candidate Photo Upload
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-50 p-4 rounded border border-slate-200">
            <div className="w-32 h-40 border-2 border-dashed border-slate-300 rounded bg-white flex flex-col items-center justify-center overflow-hidden shrink-0">
              {previewPhoto ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={previewPhoto} alt="Student Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-2 text-slate-400 text-xs">
                  <Upload className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                  Passport Photo Preview
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Upload Photograph <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                required
              />
              <p className="text-xs text-slate-500">
                Format: JPG, PNG. Maximum file size: 2MB. Clear background recommended.
              </p>
            </div>
          </div>
        </div>

        {/* Declaration and Submit */}
        <div className="border-t border-slate-200 pt-6 space-y-4">
          <div className="flex items-start gap-2 text-xs text-slate-600">
            <input type="checkbox" required id="declaration" className="mt-0.5" />
            <label htmlFor="declaration">
              I hereby declare that all the information furnished above is true, complete and correct to the best of my knowledge and belief.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto bg-blue-800 hover:bg-blue-900 text-white font-bold px-8 py-3 rounded-md text-sm transition-colors flex items-center justify-center gap-2 shadow"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Submitting Registration...
              </>
            ) : (
              'Submit Application & Register'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
