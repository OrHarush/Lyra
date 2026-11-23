import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import Column from '@/components/shared/layout/containers/Column';
import PageLayout from '@/components/shared/layout/page/PageLayout';
import { useOpen } from '@/hooks/common/useOpen';
import { useUpdateGoal } from '@/hooks/entities/useGoalMutations';
import { useGoal, useGoalProjection } from '@/hooks/entities/useGoals';
import DeleteGoalDialog from '@/pages/Goals/components/dialogs/DeleteGoalDialog';
import EditGoalDialog from '@/pages/Goals/components/dialogs/EditGoalDialog';
import ContributionsList from '@/pages/Goals/GoalDetail/ContributionsList';
import GoalDetailHeader from '@/pages/Goals/GoalDetail/GoalDetailHeader';
import GoalDetailSkeleton from '@/pages/Goals/GoalDetail/GoalDetailSkeleton';
import GoalNumbersStrip from '@/pages/Goals/GoalDetail/GoalNumbersStrip';
import NarrativeHeadline from '@/pages/Goals/GoalDetail/NarrativeHeadline';
import ProjectionChart from '@/pages/Goals/GoalDetail/ProjectionChart';
import { useSnackbar } from '@/providers/SnackbarProvider';

const FALLBACK_COLOR = '#9ca3af';

const GoalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('goals');
  const navigate = useNavigate();
  const { alertSuccess, alertError } = useSnackbar();
  const { goal, isLoading: isLoadingGoal } = useGoal(id);
  const { projection, isLoading: isLoadingProjection } = useGoalProjection(id);
  const updateGoal = useUpdateGoal();
  const [isEditOpen, openEdit, closeEdit] = useOpen();
  const [isDeleteOpen, openDelete, closeDelete] = useOpen();

  if (isLoadingGoal || isLoadingProjection) {
    return (
      <PageLayout>
        <GoalDetailSkeleton />
      </PageLayout>
    );
  }

  if (!goal || !projection) {
    return (
      <PageLayout>
        <Typography variant="body1">{t('detail.notFound')}</Typography>
      </PageLayout>
    );
  }

  const goalColor = goal.color ?? goal.category?.color ?? FALLBACK_COLOR;
  const categoryName = goal.category?.name ?? goal.name;

  const markAchieved = async () => {
    try {
      await updateGoal.mutateAsync({ goalId: goal._id, patch: { status: 'achieved' } });
      alertSuccess(t('toast.statusAchieved'));
      navigate('/goals');
    } catch {
      alertError(t('errors.updateFailed'));
    }
  };

  return (
    <PageLayout>
      <Column spacing={2}>
        <GoalDetailHeader goal={goal} onEdit={openEdit} onDelete={openDelete} />
        <NarrativeHeadline
          goal={goal}
          projection={projection}
          onMarkAchieved={markAchieved}
          isMarkingAchieved={updateGoal.isPending}
        />
        <GoalNumbersStrip
          current={projection.currentValue}
          target={goal.targetAmount}
          monthly={projection.requiredMonthlyContribution}
        />
        <ProjectionChart
          projection={projection}
          goalColor={goalColor}
          targetAmount={goal.targetAmount}
        />
        <ContributionsList
          contributionsByMonth={projection.contributionsByMonth}
          goalCategoryName={categoryName}
        />
      </Column>

      {isEditOpen && (
        <EditGoalDialog
          isOpen={isEditOpen}
          closeDialog={closeEdit}
          goal={goal}
          currentValue={projection.currentValue}
        />
      )}
      {isDeleteOpen && (
        <DeleteGoalDialog
          isOpen={isDeleteOpen}
          closeDialog={closeDelete}
          goal={goal}
          redirectAfterDelete
        />
      )}
    </PageLayout>
  );
};

export default GoalDetail;
