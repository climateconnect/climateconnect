from django.db import models, migrations


def create_sort_user_preferences_sql_function():
    return """
create or replace function sort_user_preferences(relative_user_id int)
returns table (
    user_id int, reference_type_id int, reference_model varchar
    , matching_score bigint
)
as $$
begin
    return Query
        select CMUQA.user_id as user_id
            , CMAMD.reference_type_id as reference_type_id
            , DCT.model as reference_model
            , sum(CMAMD.weight) as matching_score
        from climate_match_userquestionanswer CMUQA
        join climate_match_answer CMA on CMA.id = CMUQA.predefined_answer_id 
        join climate_match_answer_answer_metadata CMAAMD on CMAAMD.answer_id = CMA.id
        join climate_match_answermetadata CMAMD on CMAMD.id = CMAAMD.answermetadata_id 
        join django_content_type DCT on DCT.id = CMAMD.reference_type_id 
        where CMUQA.user_id = relative_user_id
            and CMUQA.predefined_answer_id is not null
        group by 1, 2, 3
        order by matching_score desc;
end
$$
language plpgsql;
    """


class Migration(migrations.Migration):
    dependencies = [
        ('climate_match', '0008_auto_20210722_1450'),
    ]

    operations = [
        migrations.RunSQL(
            sql=create_sort_user_preferences_sql_function(),
            reverse_sql="drop function sort_user_preferences(int);"
        )
    ]
