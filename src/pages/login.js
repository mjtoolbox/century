import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useRouter } from 'next/navigation';
import { Formik, Field, Form } from 'formik';

const Login = () => {
  const [errors, setErrors] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const initialValues = {
    email: '',
    password: '',
  };

  const validateForm = (values) => {
    const errors = {};

    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = 'Invalid email address';
    }

    if (!values.password) {
      errors.password = 'Password number is required';
    } else if (values.password.length <= 8) {
      errors.password = 'Password length must be more than 7';
    }

    return errors;
  };

  const onLogin = (values) => {
    setLoading(true);
    signInWithEmailAndPassword(auth, values.email, values.password)
      .then((userCredential) => {
        // Signed in
        setLoading(false);
        const user = userCredential.user;
        console.log(user);
        router.push('/admin');
        console.log(user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        setErrors(errorMessage);
        setLoading(false);
        console.log(errorCode, errorMessage);
      });
  };

  return (
    <>
      <main>
        <section>
          <div className='md:grid grid-cols-3 h-screen '>
            <div></div>
            <div className='flex flex-col justify-center h-screen'>
              <div className=' px-10 '>
                <div>
                  <h2 className='text-black text-center md:text-sm text-xs tracking-tight text-gray-900'>
                    Century Kumdo Admin Login
                  </h2>
                </div>

                <div className='mt-4 text-xs' style={{ color: 'red' }}>
                  {errors && errors}
                </div>

                <div>
                  <Formik
                    initialValues={initialValues}
                    validate={validateForm}
                    onSubmit={(values) => onLogin(values)}
                  >
                    {({
                      values,
                      errors,
                      touched,
                      handleChange,
                      handleBlur,
                      handleSubmit,
                      isSubmitting,
                    }) => (
                      <Form className='mt-8 space-y-6'>
                        <div className=' space-y-6 rounded-md shadow-sm'>
                          <div>
                            <label htmlFor='email-address' className='sr-only'>
                              Email address
                            </label>
                            <Field
                              type='email'
                              id='email'
                              name='email'
                              value={values.email}
                              onChange={handleChange}
                              className='relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                              placeholder='Email address'
                            />

                            <p className='text-xs' style={{ color: 'red' }}>
                              {errors.email && touched.email && errors.email}
                            </p>
                          </div>

                          <div>
                            <label htmlFor='password' className='sr-only'>
                              Password
                            </label>
                            <Field
                              type='password'
                              id='password'
                              name='password'
                              value={values.password}
                              onChange={handleChange}
                              className='relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                              placeholder='Password'
                            />

                            <p className='text-xs' style={{ color: 'red' }}>
                              {errors.password &&
                                touched.password &&
                                errors.password}
                            </p>
                          </div>
                        </div>

                        <div>
                          <button
                            type='submit'
                            className='group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                          >
                            <span>
                              {loading ? 'Logging in ...' : ' Login '}
                            </span>
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
              <div></div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Login;
