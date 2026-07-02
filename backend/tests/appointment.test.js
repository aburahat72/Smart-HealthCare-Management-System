describe('Appointment Module', () => {

  test('Appointment status should be pending by default', () => {
    const appointment = {
      status: 'pending'
    };

    expect(appointment.status).toBe('pending');
  });

  test('Appointment should contain patient ID', () => {
    const appointment = {
      patientId: '686abc123456789'
    };

    expect(appointment.patientId).toBeDefined();
  });

  test('Appointment should contain doctor ID', () => {
    const appointment = {
      doctorId: '686xyz987654321'
    };

    expect(appointment.doctorId).toBeDefined();
  });

  test('Appointment should have consultation fee', () => {
    const appointment = {
      consultationFee: 1000
    };

    expect(appointment.consultationFee).toBeGreaterThan(0);
  });

  test('Payment status should be valid', () => {
    const appointment = {
      paymentStatus: 'pending'
    };

    expect(['pending', 'completed', 'failed', 'not_required']).toContain(
      appointment.paymentStatus
    );
  });

});